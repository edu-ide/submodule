import * as vscode from 'vscode';
import * as crypto from 'crypto';
import axios from 'axios';
import { EventEmitter } from 'node:events';
import * as http from 'http';
import * as url from 'url';

// --- Constants (Adopted structure) ---
export const AUTH_PROVIDER_ID = 'edusense-auth';
const AUTH_PROVIDER_NAME = 'EduSense';
const AUTH_SERVER_URL = 'http://localhost:8881';
const CLIENT_ID = 'app-client';
const SESSIONS_SECRET_KEY = `${AUTH_PROVIDER_ID}.sessions`;
export const SCOPES = ['openid', 'profile', 'email', 'api.read', 'offline_access'];
const PUBLISHER_NAME = 'pearai';
const EXTENSION_NAME = 'pearai';
const VSCODE_REDIRECT_PATH = '/auth-callback';
const REDIRECT_URI = `pearai://${PUBLISHER_NAME}.${EXTENSION_NAME}${VSCODE_REDIRECT_PATH}`;
const FIVE_MINUTES_MS = 1000 * 60 * 5;

// --- New constants for Local HTTP Server ---
const LOCAL_SERVER_PORT = 15512;
const LOCAL_CALLBACK_PATH = '/auth-callback';
const REDIRECT_URI_LOCAL = `http://localhost:${LOCAL_SERVER_PORT}${LOCAL_CALLBACK_PATH}`;
// ------------------------------------------

// --- Helper Functions (PKCE, etc.) ---
function generateRandomString(length = 32): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}
async function generateCodeChallenge(verifier: string): Promise<string> {
    const hash = crypto.createHash('sha256').update(verifier).digest();
    return hash.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
// --------------------------------------

// --- Session Interface ---
export interface EduSenseAuthSession extends vscode.AuthenticationSession {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
}
// ------------------------

export class EduSenseProvider implements vscode.AuthenticationProvider, vscode.Disposable {
    private _sessionChangeEmitter = new vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>();
    readonly onDidChangeSessions = this._sessionChangeEmitter.event;

    private _disposable: vscode.Disposable;
    private _pendingStates = new Map<string, { codeVerifier: string; resolve: (session: EduSenseAuthSession) => void; reject: (reason?: any) => void }>();
    private _httpServer: http.Server | undefined;
    private _refreshTimeout: NodeJS.Timeout | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {
        this._disposable = vscode.Disposable.from(
            vscode.authentication.registerAuthenticationProvider(
                AUTH_PROVIDER_ID,
                AUTH_PROVIDER_NAME,
                this,
                { supportsMultipleAccounts: false }
            ),
            { dispose: () => this.stopHttpServer() }
        );

        this.initialize();
        this.startHttpServer();
    }

    async initialize(): Promise<void> {
        const sessions = await this.getSessions();
        if (sessions.length > 0) {
            console.log("[EduSenseProvider] Found existing sessions on initialization.");
            await this.refreshSessionsIfNeeded(sessions);
        }
        this.scheduleNextRefresh();
    }

    private async readSessionsFromSecrets(): Promise<EduSenseAuthSession[]> {
        const sessionsData = await this.context.secrets.get(SESSIONS_SECRET_KEY);
        if (sessionsData) {
            try {
                return JSON.parse(sessionsData) as EduSenseAuthSession[];
            } catch (e) {
                console.error("[EduSenseProvider] Failed to parse stored sessions:", e);
                await this.context.secrets.delete(SESSIONS_SECRET_KEY);
            }
        }
        return [];
    }

    private async storeSessionsInSecrets(sessions: EduSenseAuthSession[]): Promise<void> {
        await this.context.secrets.store(SESSIONS_SECRET_KEY, JSON.stringify(sessions));
    }

    private scheduleNextRefresh(): void {
        if (this._refreshTimeout) {
            clearTimeout(this._refreshTimeout);
            this._refreshTimeout = undefined;
        }

        this.readSessionsFromSecrets().then(sessions => {
            if (sessions.length > 0 && sessions[0].expiresAt) {
                const now = Date.now();
                const refreshBufferMs = 1000 * 60 * 1;
                const refreshIn = sessions[0].expiresAt - now - refreshBufferMs;
                const nextRefreshTime = new Date(Date.now() + Math.max(0, refreshIn)).toLocaleTimeString();

                if (refreshIn > 0) {
                    console.log(`[EduSenseProvider] Scheduling next token refresh based on expiresAt at approximately ${nextRefreshTime} (${Math.round(refreshIn / 1000)} seconds from now).`);
                    this._refreshTimeout = setTimeout(() => {
                        console.log(`[EduSenseProvider] Scheduled refresh time reached (based on expiresAt). Running refreshIfNeeded.`);
                        this._refreshTimeout = undefined;
                        this.refreshSessionsIfNeeded();
                    }, refreshIn);
                } else {
                    console.log("[EduSenseProvider] Session expired or close to expiry (based on expiresAt), refreshing now.");
                    this.refreshSessionsIfNeeded();
                }
            } else {
                console.log("[EduSenseProvider] No session found or session has no expiry, not scheduling refresh.");
            }
        }).catch(err => {
            console.error("[EduSenseProvider] Error reading sessions for scheduling refresh:", err);
        });
    }

    async refreshSessionsIfNeeded(sessions?: readonly EduSenseAuthSession[]): Promise<void> {
        console.log("[EduSenseProvider] Checking if session refresh is needed...");
        const sessionsToRefresh = sessions ? [...sessions] : await this.readSessionsFromSecrets();
        console.log(`[EduSenseProvider refreshSessionsIfNeeded] Found ${sessionsToRefresh.length} sessions to potentially refresh.`);

        if (sessionsToRefresh.length === 0) {
            console.log("[EduSenseProvider] No sessions to refresh.");
            if (this._refreshTimeout) {
                clearTimeout(this._refreshTimeout);
                this._refreshTimeout = undefined;
                console.log("[EduSenseProvider refreshSessionsIfNeeded] Cleared existing refresh timeout as no sessions were found.");
            }
            return;
        }

        let refreshed = false;
        const updatedSessions: EduSenseAuthSession[] = [];
        const removedSessionIdsDueToError: string[] = [];

        for (const session of sessionsToRefresh) {
            const now = Date.now();
            const refreshBufferMs = 1000 * 60 * 1;
            const needsRefresh = session.expiresAt ? now >= (session.expiresAt - refreshBufferMs) : !session.refreshToken;

            console.log(`[EduSenseProvider refreshSessionsIfNeeded] Session ${session.id}: ExpiresAt=${session.expiresAt ? new Date(session.expiresAt).toLocaleString() : 'N/A'}, Now=${new Date(now).toLocaleString()}, Buffer=${refreshBufferMs / 1000}s, NeedsRefresh=${needsRefresh}, HasRefreshToken=${!!session.refreshToken}`);

            if (needsRefresh && session.refreshToken) {
                console.log(`[EduSenseProvider] Refreshing session ${session.id} (Reason: Needs refresh)...`);
                try {
                    const newSessionData = await this.performTokenRefresh(session.refreshToken);
                    const updatedSession: EduSenseAuthSession = {
                        ...session,
                        accessToken: newSessionData.access_token,
                        refreshToken: newSessionData.refresh_token || session.refreshToken,
                        scopes: newSessionData.scope ? newSessionData.scope.split(' ') : session.scopes,
                        expiresAt: newSessionData.expires_in ? now + (newSessionData.expires_in * 1000) : undefined
                    };
                    updatedSessions.push(updatedSession);
                    refreshed = true;
                    console.log(`[EduSenseProvider] Session ${session.id} refreshed successfully.`);
                } catch (e) {
                    const errorMessage = e instanceof Error ? e.message : String(e);
                    console.error(`[EduSenseProvider] Failed to refresh session ${session.id}:`, errorMessage);
                    if (errorMessage.includes('invalid_grant')) {
                        console.warn(`[EduSenseProvider] Invalid grant during refresh for session ${session.id}. Marking session for removal.`);
                        removedSessionIdsDueToError.push(session.id);
                        refreshed = true;
                    } else {
                        console.warn(`[EduSenseProvider] Keeping existing session ${session.id} after non-fatal refresh error: ${errorMessage}`);
                        updatedSessions.push(session);
                    }
                }
            } else if (!needsRefresh) {
                updatedSessions.push(session);
            } else {
                console.warn(`[EduSenseProvider refreshSessionsIfNeeded] Session ${session.id} needs refresh but has no refresh token. Marking for removal.`);
                removedSessionIdsDueToError.push(session.id);
                refreshed = true;
            }
        }

        if (refreshed) {
            const sessionsToStore = updatedSessions.filter(s => !removedSessionIdsDueToError.includes(s.id));
            console.log(`[EduSenseProvider] Storing updated sessions. Total before update: ${sessionsToRefresh.length}, To store: ${sessionsToStore.length}, Removed due to error: ${removedSessionIdsDueToError.length}`);
            await this.storeSessionsInSecrets(sessionsToStore);

            const originalSessionIds = new Set((sessions ?? sessionsToRefresh).map(s => s.id));
            const finalSessionIds = new Set(sessionsToStore.map(s => s.id));

            const addedSessions = sessionsToStore.filter(s => !originalSessionIds.has(s.id));
            const trulyRemovedSessions = (sessions ?? sessionsToRefresh).filter(s => !finalSessionIds.has(s.id) || removedSessionIdsDueToError.includes(s.id));
            const changedSessions = sessionsToStore.filter(s => originalSessionIds.has(s.id));

            console.log(`[EduSenseProvider refreshSessionsIfNeeded] Firing change event - Added: ${addedSessions.length}, Removed: ${trulyRemovedSessions.length}, Changed: ${changedSessions.length}`);
            if (addedSessions.length > 0 || trulyRemovedSessions.length > 0 || changedSessions.length > 0) {
                this._sessionChangeEmitter.fire({ added: addedSessions, removed: trulyRemovedSessions, changed: changedSessions });
            }
            this.scheduleNextRefresh();
        } else {
            console.log("[EduSenseProvider] No session refresh was performed or needed.");
            if (!this._refreshTimeout && updatedSessions.length > 0) {
                console.log("[EduSenseProvider] No refresh occurred, but ensuring next refresh is scheduled based on expiresAt.");
                this.scheduleNextRefresh();
            }
        }
    }

    private async performTokenRefresh(refreshToken: string): Promise<{ access_token: string; refresh_token?: string; expires_in: number; scope?: string }> {
        const PROXY_TOKEN_ENDPOINT = `${AUTH_SERVER_URL}/api/proxy/token`;
        console.log(`[EduSenseProvider] Performing token refresh via proxy: ${PROXY_TOKEN_ENDPOINT}`);

        const tokenParams = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        });

        try {
            const response = await axios.post<
                { access_token: string; refresh_token?: string; expires_in: number; scope?: string }
            >(
                PROXY_TOKEN_ENDPOINT,
                tokenParams,
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            if (response.data && typeof response.data === 'object' && 'error' in response.data) {
                const errorData = response.data as { error: string, error_description?: string };
                console.error(`[EduSenseProvider] Proxy returned error during refresh: ${errorData.error} - ${errorData.error_description}`);
                if (errorData.error === 'invalid_grant') {
                    throw new Error('invalid_grant');
                }
                throw new Error(errorData.error_description || errorData.error || 'Unknown error from proxy during refresh');
            }

            if (!response.data || !response.data.access_token) {
                console.error('[EduSenseProvider] Invalid response from proxy during token refresh:', response.data);
                throw new Error('Invalid response from proxy during token refresh');
            }

            console.log('[EduSenseProvider] Token refresh via proxy successful.');
            return {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token || refreshToken,
                expires_in: response.data.expires_in || (FIVE_MINUTES_MS / 1000),
                scope: response.data.scope || SCOPES.join(' ')
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('[EduSenseProvider] Token refresh via proxy failed (Axios Error): ', error.response?.data, error.response?.status);
                const errorData = error.response?.data as { error?: string, error_description?: string };
                if (errorData?.error === 'invalid_grant') {
                    throw new Error('invalid_grant');
                }
                const message = `Proxy token refresh failed (${error.response?.status}): ${errorData?.error_description || errorData?.error || 'Server error'}`;
                throw new Error(message);
            }
            console.error('[EduSenseProvider] Token refresh via proxy failed (Unknown Error): ', error);
            const message = error instanceof Error ? error.message : String(error);
            if (message !== 'invalid_grant') {
                throw new Error(`Token refresh failed: ${message}`);
            }
            throw error;
        }
    }

    async getSessions(scopes?: readonly string[]): Promise<readonly EduSenseAuthSession[]> {
        console.log("[EduSenseProvider] getSessions called.");
        const sessions = await this.readSessionsFromSecrets();

        if (scopes) {
            return sessions.filter(session =>
                scopes.every(scope => session.scopes.includes(scope))
            );
        }
        return sessions;
    }

    async createSession(scopes: readonly string[]): Promise<EduSenseAuthSession> {
        console.log(`[EduSenseProvider createSession] Entered. forceNewSession likely triggered this.`);
        console.log(`[EduSenseProvider createSession] Scopes received: ${scopes.join(', ')}`);

        return new Promise<EduSenseAuthSession>(async (resolve, reject) => {
            console.log(`[EduSenseProvider createSession] Promise executor started.`);

            const codeVerifier = generateRandomString(64);
            const codeChallenge = await generateCodeChallenge(codeVerifier);
            const state = generateRandomString(32);
            console.log(`[EduSenseProvider createSession] Generated state: ${state}`);


            console.log(`[EduSenseProvider] Storing pending state: ${state}`);
            this._pendingStates.set(state, { codeVerifier, resolve, reject });

            const authUrl = new URL(`${AUTH_SERVER_URL}/oauth2/authorize`);
            const params = {
                response_type: 'code',
                client_id: CLIENT_ID,
                redirect_uri: REDIRECT_URI_LOCAL,
                scope: scopes.join(' '),
                state: state,
                code_challenge: codeChallenge,
                code_challenge_method: 'S256',
            };
            Object.entries(params).forEach(([key, value]) => authUrl.searchParams.append(key, value));

            console.log(`[EduSenseProvider createSession] Prepared auth URL: ${authUrl.toString()}`);
            console.log(`[EduSenseProvider] Opening external browser: ${authUrl.toString()}`);
            const opened = await vscode.env.openExternal(vscode.Uri.parse(authUrl.toString()));
            console.log(`[EduSenseProvider createSession] vscode.env.openExternal returned: ${opened}`);


            if (!opened) {
                console.error("[EduSenseProvider createSession] Could not open external browser.");
                this._pendingStates.delete(state);
                reject(new Error("Could not open authentication URL."));
                vscode.window.showErrorMessage("로그인 URL을 브라우저에서 열 수 없습니다.");
            } else {
                console.log(`[EduSenseProvider createSession] External browser opened successfully. Waiting for callback with state: ${state}`);
            }
        });
    }

    async removeSession(sessionId: string): Promise<void> {
        console.log(`[EduSenseProvider removeSession] Entered for ID: ${sessionId}`);

        if (this._refreshTimeout) {
            console.log(`[EduSenseProvider removeSession] Clearing scheduled refresh timeout.`);
            clearTimeout(this._refreshTimeout);
            this._refreshTimeout = undefined;
        }

        const sessions = await this.readSessionsFromSecrets();
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        console.log(`[EduSenseProvider removeSession] Found session index: ${sessionIndex}`);

        if (sessionIndex > -1) {
            const removedSession = sessions.splice(sessionIndex, 1)[0];
            console.log(`[EduSenseProvider removeSession] Session object removed from array.`);
            try {
                await this.storeSessionsInSecrets(sessions);
                console.log(`[EduSenseProvider removeSession] Updated sessions stored in secrets.`);
            } catch (storeError) {
                console.error(`[EduSenseProvider removeSession] Error storing updated secrets:`, storeError);
            }

            console.log(`[EduSenseProvider removeSession] Preparing to fire _sessionChangeEmitter for removed session ID: ${removedSession.id}`);
            try {
                this._sessionChangeEmitter.fire({ added: [], removed: [removedSession], changed: [] });
                console.log(`[EduSenseProvider removeSession] Successfully fired _sessionChangeEmitter.`);
            } catch (fireError) {
                console.error(`[EduSenseProvider removeSession] Error firing _sessionChangeEmitter:`, fireError);
            }

            try {
                await this.revokeToken(removedSession.accessToken, removedSession.refreshToken);
                console.log(`[EduSenseProvider removeSession] Session tokens revoked.`);
            } catch (e) {
                console.warn(`[EduSenseProvider removeSession] Failed to revoke tokens for session ${sessionId}:`, e);
            }
        } else {
            console.warn(`[EduSenseProvider removeSession] Session ID ${sessionId} not found for removal.`);
        }
        console.log(`[EduSenseProvider removeSession] Exiting for ID: ${sessionId}`);
    }

    private startHttpServer(): void {
        if (this._httpServer) {
            console.log('[EduSenseProvider HttpServer] Server already running.');
            return;
        }

        this._httpServer = http.createServer(this.handleHttpRequest.bind(this));

        this._httpServer.on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`[EduSenseProvider HttpServer] Port ${LOCAL_SERVER_PORT} is already in use.`);
                vscode.window.showErrorMessage(`인증 콜백을 위한 로컬 포트 ${LOCAL_SERVER_PORT}를 사용할 수 없습니다. 다른 프로그램이 사용 중일 수 있습니다.`);
                this._httpServer?.close();
                this._httpServer = undefined;
            } else {
                console.error('[EduSenseProvider HttpServer] Server error:', err);
            }
        });

        this._httpServer.listen(LOCAL_SERVER_PORT, '127.0.0.1', () => {
            console.log(`[EduSenseProvider HttpServer] Listening on http://localhost:${LOCAL_SERVER_PORT}`);
        });
    }

    private stopHttpServer(): void {
        if (this._httpServer) {
            console.log('[EduSenseProvider HttpServer] Stopping server...');
            this._httpServer.close((err) => {
                if (err) {
                    console.error('[EduSenseProvider HttpServer] Error closing server:', err);
                } else {
                    console.log('[EduSenseProvider HttpServer] Server stopped.');
                }
            });
            this._httpServer = undefined;
        }
    }

    private async handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
        if (!req.url) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Bad Request: URL missing');
            return;
        }

        const parsedUrl = url.parse(req.url, true);

        if (parsedUrl.pathname !== LOCAL_CALLBACK_PATH) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
        }

        console.log(`[EduSenseProvider HttpServer] Received request for: ${req.url}`);

        const queryParams = parsedUrl.query;
        const code = typeof queryParams.code === 'string' ? queryParams.code : undefined;
        const state = typeof queryParams.state === 'string' ? queryParams.state : undefined;
        const error = typeof queryParams.error === 'string' ? queryParams.error : undefined;
        const errorDescription = typeof queryParams.error_description === 'string' ? queryParams.error_description : undefined;

        console.log(`[EduSenseProvider HttpServer] Parsed params - code: ${code ? 'present' : 'missing'}, state: ${state}, error: ${error}`);


        const pendingStateData = state ? this._pendingStates.get(state) : undefined;
        if (!pendingStateData) {
            console.error(`[EduSenseProvider HttpServer] State mismatch or not found. Received state: ${state}, Pending states: ${Array.from(this._pendingStates.keys()).join(', ')}`);
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>로그인 오류</h1><p>잘못된 로그인 콜백입니다 (state 불일치).</p>');
            return;
        }
        console.log(`[EduSenseProvider HttpServer] State verified: ${state}`);


        if (state) {
            this._pendingStates.delete(state);
            console.log(`[EduSenseProvider HttpServer] Pending state deleted: ${state}`);
        }

        const { codeVerifier, resolve, reject } = pendingStateData;

        if (error) {
            console.error(`[EduSenseProvider HttpServer] Authentication error from server: ${error} - ${errorDescription}`);
            reject(new Error(errorDescription ?? error ?? 'Unknown authentication error from callback'));
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h1>로그인 오류</h1><p>인증 서버에서 오류가 발생했습니다: ${errorDescription || error}</p>`);
            return;
        }

        if (!code) {
            console.error('[EduSenseProvider HttpServer] Authorization code is missing in the callback URI.');
            reject(new Error('Authorization code missing in callback URI.'));
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>로그인 오류</h1><p>인증 코드가 콜백 URI에 없습니다.</p>');
            return;
        }

        try {
            console.log('[EduSenseProvider HttpServer] Attempting to exchange authorization code for tokens...');
            const tokenData = await this.exchangeCodeForToken(code, codeVerifier);
            console.log('[EduSenseProvider HttpServer] Token exchange successful.');

            console.log('[EduSenseProvider HttpServer] Fetching user info...');
            let accountInfo: vscode.AuthenticationSessionAccountInformation = { id: 'unknown-user', label: 'Unknown User' };
            try {
                const userInfo = await this.fetchUserInfo(tokenData.access_token);
                accountInfo = { id: userInfo.sub, label: userInfo.preferred_username || userInfo.name || userInfo.sub };
                console.log(`[EduSenseProvider HttpServer] User info fetched: ${accountInfo.label} (${accountInfo.id})`);
            } catch (e) {
                console.warn("[EduSenseProvider HttpServer] Failed to fetch user info:", e);
            }

            const expiresInMs = (tokenData.expires_in || (FIVE_MINUTES_MS / 1000)) * 1000;
            const expiresAt = Date.now() + expiresInMs;

            const session: EduSenseAuthSession = {
                id: generateRandomString(),
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                account: accountInfo,
                scopes: tokenData.scope?.split(' ') || SCOPES,
                expiresAt: expiresAt,
            };

            // --- 성공 페이지 URL 정의 및 즉시 로깅 ---
            const successRedirectUrl = 'http://localhost:5174/auth/success';
            console.log(`[EduSenseProvider HttpServer] DEFINED successRedirectUrl as: ${successRedirectUrl}`);
            // ---------------------------------------

            console.log(`[EduSenseProvider HttpServer] Storing session and resolving promise for state: ${state}, session ID: ${session.id}`);
            await this.storeSessionsInSecrets([session]);
            resolve(session);
            this._sessionChangeEmitter.fire({ added: [session], removed: [], changed: [] });
            console.log(`[EduSenseProvider HttpServer] Session created and event fired for ${session.account.label}.`);
            this.scheduleNextRefresh();

            // --- 리디렉션 헤더 전송 ---
            console.log(`[EduSenseProvider HttpServer] Preparing to send redirect. Location will be set to value of successRedirectUrl which is: ${successRedirectUrl}`);
            res.writeHead(302, { 'Location': successRedirectUrl });
            res.end();
            console.log(`[EduSenseProvider HttpServer] Redirect response sent.`);
            // -----------------------------

        } catch (err) {
            console.error('[EduSenseProvider HttpServer] Error during token exchange or session finalization:', err);
            reject(err);
            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h1>로그인 처리 오류</h1><p>로그인 처리 중 내부 오류가 발생했습니다: ${err instanceof Error ? err.message : 'Unknown error'}</p>`);
        }
    }

    private async exchangeCodeForToken(code: string, codeVerifier: string): Promise<{ access_token: string; refresh_token?: string; expires_in: number; scope?: string }> {
        const tokenParams = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI_LOCAL,
            code_verifier: codeVerifier,
            client_id: CLIENT_ID,
        });
        try {
            const response = await axios.post<{ access_token: string; refresh_token?: string; id_token?: string; token_type: string; expires_in: number; scope?: string }>(
                `${AUTH_SERVER_URL}/oauth2/token`, tokenParams, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
            if (response.data && typeof response.data === 'object' && 'error' in response.data) {
                const errorData = response.data as { error: string, error_description?: string };
                throw new Error(`Token endpoint error: ${errorData.error} - ${errorData.error_description || 'Unknown error'}`);
            }
            if (!response.data || !response.data.access_token) throw new Error('Invalid token response');
            const tokenResponseData = {
                ...response.data,
                expires_in: response.data.expires_in ?? (FIVE_MINUTES_MS / 1000)
            };
            return tokenResponseData;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('[EduSenseProvider] Token exchange error response data:', error.response.data);
                throw new Error(`Token exchange failed (${error.response.status}): ${error.response.data?.error_description || error.response.data?.error || 'Server error'}`);
            }
            throw error;
        }
    }

    private async fetchUserInfo(accessToken: string): Promise<{ sub: string; name?: string; preferred_username?: string }> {
        try {
            const response = await axios.get<{ sub: string, name?: string, preferred_username?: string, email?: string, picture?: string }>(
                `${AUTH_SERVER_URL}/userinfo`, { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            if (!response.data || !response.data.sub) throw new Error("Invalid user info response (missing sub).");
            return response.data;
        } catch (error) {
            console.error('[EduSenseProvider] Failed to fetch user info:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                console.warn("[EduSenseProvider] Unauthorized fetching user info. Token might be invalid.");
            }
            throw new Error(`Failed to fetch user info: ${error instanceof Error ? error.message : error}`);
        }
    }

    private async revokeToken(accessToken: string, refreshToken?: string): Promise<void> {
        const revokeEndpoint = `${AUTH_SERVER_URL}/oauth2/revoke`;
        try {
            const revokeAccessParams = new URLSearchParams({
                token: accessToken, token_type_hint: 'access_token', client_id: CLIENT_ID
            });
            await axios.post(revokeEndpoint, revokeAccessParams, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
            console.log('[EduSenseProvider] Access token revoked successfully.');
        } catch (error) { console.warn('[EduSenseProvider] Failed to revoke access token:', error); }
        if (refreshToken) {
            try {
                const revokeRefreshParams = new URLSearchParams({
                    token: refreshToken, token_type_hint: 'refresh_token', client_id: CLIENT_ID
                });
                await axios.post(revokeEndpoint, revokeRefreshParams, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
                console.log('[EduSenseProvider] Refresh token revoked successfully.');
            } catch (error) { console.warn('[EduSenseProvider] Failed to revoke refresh token:', error); }
        }
    }

    private async isTokenExpired(accessToken: string): Promise<boolean> {
        try {
            await this.fetchUserInfo(accessToken);
            return false;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) return true;
            return false;
        }
    }

    dispose(): void {
        if (this._refreshTimeout) {
            clearTimeout(this._refreshTimeout);
            this._refreshTimeout = undefined;
            console.log('[EduSenseProvider dispose] Cleared scheduled refresh timeout.');
        }
        this.stopHttpServer();
        this._disposable.dispose();
        this._sessionChangeEmitter.dispose();
        this._pendingStates.clear();
        console.log('[EduSenseProvider dispose] Disposed.');
    }
} 