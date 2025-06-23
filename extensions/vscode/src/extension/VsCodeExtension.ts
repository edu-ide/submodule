// Note: This file has been modified significantly from its original contents. New commands have been added, and there has been renaming from Continue to PearAI. pearai-submodule is a fork of Continue (https://github.com/continuedev/continue).

import { IContextProvider } from "core";
import { ConfigHandler } from "core/config/ConfigHandler";
import { Core } from "core/core";
import { FromCoreProtocol, ToCoreProtocol } from "core/protocol";
import { InProcessMessenger } from "core/util/messenger";
import { getConfigJsonPath, getConfigTsPath } from "core/util/paths";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import * as vscode from "vscode";
import { ContinueCompletionProvider } from "../autocomplete/completionProvider";
import {
  monitorBatteryChanges,
  setupStatusBar,
  StatusBarStatus,
} from "../autocomplete/statusBar";
import { registerAllCommands } from "../commands";
import { ContinueGUIWebviewViewProvider } from "../ContinueGUIWebviewViewProvider";
import { registerDebugTracker } from "../debug/debug";
import { DiffManager } from "../diff/horizontal";
import { VerticalPerLineDiffManager } from "../diff/verticalPerLine/manager";
import { VsCodeIde } from "../ideProtocol";
import { registerAllCodeLensProviders } from "../lang-server/codeLens";
import { QuickEdit } from "../quickEdit/QuickEditQuickPick";
import { setupRemoteConfigSync } from "../stubs/activation";
import {
  getControlPlaneSessionInfo,
  WorkOsAuthProvider,
} from "../stubs/WorkOsAuthProvider";
import { Battery } from "../util/battery";
import { TabAutocompleteModel } from "../util/loadAutocompleteModel";
import type { VsCodeWebviewProtocol } from "../webviewProtocol";
import { VsCodeMessenger } from "./VsCodeMessenger";
import { PEARAI_CHAT_VIEW_ID, PEARAI_MEM0_VIEW_ID, PEARAI_SEARCH_VIEW_ID, PEARAI_CURRICULUM_VIEW_ID } from "../util/pearai/pearaiViewTypes";
import { EduSenseProvider, AUTH_PROVIDER_ID, SCOPES } from "../auth/EduSenseProvider";
import { getNonce, getExtensionUri, getUniqueId } from "../util/vscode";
import { getTheme } from "../util/getTheme";
import { getExtensionVersion } from "../util/util";
import { isFirstLaunch } from "../copySettings";

export class VsCodeExtension {
  // Currently some of these are public so they can be used in testing (test/test-suites)

  private configHandler: ConfigHandler;
  private extensionContext: vscode.ExtensionContext;
  private ide: VsCodeIde;
  private tabAutocompleteModel: TabAutocompleteModel;
  private sidebar: ContinueGUIWebviewViewProvider;
  private windowId: string;
  private diffManager: DiffManager;
  private verticalDiffManager: VerticalPerLineDiffManager;
  webviewProtocolPromise: Promise<VsCodeWebviewProtocol>;
  private core: Core;
  private battery: Battery;
  private eduSenseProvider: EduSenseProvider;
  private curriculumPanel: vscode.WebviewPanel | undefined = undefined;
  private resolveWebviewProtocol!: (protocol: VsCodeWebviewProtocol) => void;

  constructor(context: vscode.ExtensionContext) {
    // Register auth provider
    this.eduSenseProvider = new EduSenseProvider(context);
    context.subscriptions.push(this.eduSenseProvider);

    this.webviewProtocolPromise = new Promise<VsCodeWebviewProtocol>(
      (resolve) => {
        this.resolveWebviewProtocol = (protocol: VsCodeWebviewProtocol) => {
          console.log("[VsCodeExtension] Resolving webviewProtocolPromise...");
          resolve(protocol);
        };
      },
    );
    this.diffManager = new DiffManager(context);
    this.ide = new VsCodeIde(this.diffManager, this.webviewProtocolPromise);
    this.extensionContext = context;
    this.windowId = uuidv4();

    // Dependencies of core
    let resolveVerticalDiffManager: any = undefined;
    const verticalDiffManagerPromise = new Promise<VerticalPerLineDiffManager>(
      (resolve) => {
        resolveVerticalDiffManager = resolve;
      },
    );
    let resolveConfigHandler: any = undefined;
    const configHandlerPromise = new Promise<ConfigHandler>((resolve) => {
      resolveConfigHandler = resolve;
    });

    this.sidebar = new ContinueGUIWebviewViewProvider(
      configHandlerPromise,
      this.windowId,
      this.extensionContext,
      this.resolveWebviewProtocol
    );

    // Sidebar + Overlay
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        PEARAI_CHAT_VIEW_ID,
        this.sidebar,
        {
          webviewOptions: { retainContextWhenHidden: true },
        },
      ),
    );

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        PEARAI_SEARCH_VIEW_ID,
        this.sidebar,
        {
          webviewOptions: { retainContextWhenHidden: true },
        },
      ),
    );

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        PEARAI_MEM0_VIEW_ID,
        this.sidebar,
        {
          webviewOptions: { retainContextWhenHidden: true },
        },
      ),
    );

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        PEARAI_CURRICULUM_VIEW_ID,
        this.sidebar,
        {
          webviewOptions: { retainContextWhenHidden: true },
        },
      ),
    );

    // Config Handler with output channel
    const outputChannel = vscode.window.createOutputChannel("PearAI");
    const inProcessMessenger = new InProcessMessenger<
      ToCoreProtocol,
      FromCoreProtocol
    >();

    new VsCodeMessenger(
      inProcessMessenger,
      this.sidebar.webviewProtocol,
      this.ide,
      verticalDiffManagerPromise,
      configHandlerPromise,
      this.eduSenseProvider,
    );

    this.core = new Core(inProcessMessenger, this.ide, async (log: string) => {
      outputChannel.appendLine(
        "==========================================================================",
      );
      outputChannel.appendLine(
        "==========================================================================",
      );
      outputChannel.append(log);
    });
    this.configHandler = this.core.configHandler;
    resolveConfigHandler?.(this.configHandler);

    this.configHandler.reloadConfig();
    this.verticalDiffManager = new VerticalPerLineDiffManager(
      this.configHandler,
    );
    resolveVerticalDiffManager?.(this.verticalDiffManager);
    this.tabAutocompleteModel = new TabAutocompleteModel(this.configHandler);

    setupRemoteConfigSync(
      this.configHandler.reloadConfig.bind(this.configHandler),
    );

    // Auth 리스너 설정 (extensionContext 할당 후 호출)
    this.setupAuthListeners();

    // handleURI
    // This is the entry point when user signs in from web app
    /* // Temporarily comment out to avoid 'Protocol handler already registered' error when running two extensions
    context.subscriptions.push(
      vscode.window.registerUriHandler({
        handleUri(uri: vscode.Uri) {
          console.log(uri);
          console.log("Received a custom URI!");
          if (uri.authority === "pearai.pearai") {
            if (uri.path === "/ping") {
              vscode.window.showInformationMessage(
                "PearAI received a custom URI!",
              );
            } else if (uri.path === "/auth") {
              const queryParams = new URLSearchParams(uri.query);
              const data = {
                accessToken: queryParams.get("accessToken"),
                refreshToken: queryParams.get("refreshToken"),
                fromLogin: true,
              };
              vscode.commands.executeCommand("pearai.updateUserAuth", data);
            }
          }
        },
      }),
    );
    */

    // Indexing + pause token
    this.diffManager.webviewProtocol = this.sidebar.webviewProtocol;

    this.configHandler.loadConfig().then((config) => {
      const { verticalDiffCodeLens } = registerAllCodeLensProviders(
        context,
        this.diffManager,
        this.verticalDiffManager.filepathToCodeLens,
        config,
      );

      this.verticalDiffManager.refreshCodeLens =
        verticalDiffCodeLens.refresh.bind(verticalDiffCodeLens);
    });

    this.configHandler.onConfigUpdate((newConfig) => {
      this.sidebar.webviewProtocol?.request("configUpdate", undefined);

      this.tabAutocompleteModel.clearLlm();

      registerAllCodeLensProviders(
        context,
        this.diffManager,
        this.verticalDiffManager.filepathToCodeLens,
        newConfig,
      );
    });

    // Tab autocomplete
    const config = vscode.workspace.getConfiguration("pearai");
    const enabled = config.get<boolean>("enableTabAutocomplete");

    // Register inline completion provider
    setupStatusBar(
      enabled ? StatusBarStatus.Enabled : StatusBarStatus.Disabled,
    );
    context.subscriptions.push(
      vscode.languages.registerInlineCompletionItemProvider(
        [{ pattern: "**" }],
        new ContinueCompletionProvider(
          this.configHandler,
          this.ide,
          this.tabAutocompleteModel,
        ),
      ),
    );

    // Battery
    this.battery = new Battery();
    context.subscriptions.push(this.battery);
    context.subscriptions.push(monitorBatteryChanges(this.battery));

    const quickEdit = new QuickEdit(
      this.verticalDiffManager,
      this.configHandler,
      this.sidebar.webviewProtocol,
      this.ide,
      context,
    );

    // Commands
    console.log("[VsCodeExtension] About to call registerAllCommands...");
    try {
      registerAllCommands(
        context,
        this.ide,
        context,
        this.sidebar,
        this.configHandler,
        this.diffManager,
        this.verticalDiffManager,
        this.core.continueServerClientPromise,
        this.battery,
        quickEdit,
        this.core,
        this.eduSenseProvider,
      );
      console.log("[VsCodeExtension] Successfully called registerAllCommands.");
    } catch (error) {
      console.error("[VsCodeExtension] Error calling registerAllCommands:", error);
    }

    registerDebugTracker(this.sidebar.webviewProtocol, this.ide);

    // Listen for file saving - use global file watcher so that changes
    // from outside the window are also caught
    fs.watchFile(getConfigJsonPath(), { interval: 1000 }, async (stats) => {
      await this.configHandler.reloadConfig();
    });

    fs.watchFile(getConfigTsPath(), { interval: 1000 }, (stats) => {
      this.configHandler.reloadConfig();
    });

    // Create a file system watcher
    const watcher = vscode.workspace.createFileSystemWatcher(
      "**/*",
      false,
      false,
      false,
    );

    // Handle file creation
    watcher.onDidCreate((uri) => {
      this.refreshContextProviders();
    });

    // Handle file deletion
    watcher.onDidDelete((uri) => {
      this.refreshContextProviders();
    });

    context.subscriptions.push(watcher);

    vscode.workspace.onDidSaveTextDocument(async (event) => {
      // Listen for file changes in the workspace
      const filepath = event.uri.fsPath;

      if (filepath === getConfigJsonPath()) {
        // Trigger a toast notification to provide UI feedback that config
        // has been updated
        const showToast = context.globalState.get<boolean>(
          "showConfigUpdateToast",
          true,
        );
        if (showToast) {
          vscode.window
            .showInformationMessage("Config updated", "Don't show again")
            .then((selection) => {
              if (selection === "Don't show again") {
                context.globalState.update("showConfigUpdateToast", false);
              }
            });
        }
      }

      if (filepath.endsWith(".pearairc.json") || filepath.endsWith(".prompt")) {
        this.configHandler.reloadConfig();
      } else if (
        filepath.endsWith(".pearaiignore") ||
        filepath.endsWith(".gitignore")
      ) {
        // Reindex the workspaces
        this.core.invoke("index/forceReIndex", undefined);
      } else {
        // Reindex the file
        const indexer = await this.core.codebaseIndexerPromise;
        indexer.refreshFile(filepath);
      }
    });

    // When GitHub sign-in status changes, reload config
    vscode.authentication.onDidChangeSessions(async (e) => {
      if (e.provider.id === "github") {
        this.configHandler.reloadConfig();
      }
      // When EduSense sign-in status changes, notify webview
      if (e.provider.id === AUTH_PROVIDER_ID) {
        console.log('[VsCodeExtension] EduSense authentication session changed:', e);
        
        // Get current session info
        try {
          const sessionInfo = await vscode.authentication.getSession(AUTH_PROVIDER_ID, SCOPES, { silent: true });
          const webviewProtocol = await this.webviewProtocolPromise;
          
          // Notify webview about session change
          await webviewProtocol.request("didChangeControlPlaneSessionInfo", {
            sessionInfo: sessionInfo ? {
              accessToken: sessionInfo.accessToken,
              account: {
                label: sessionInfo.account.label,
                id: sessionInfo.account.id
              }
            } : undefined
          });
          
          console.log('[VsCodeExtension] Notified webview about EduSense session change');
        } catch (error) {
          console.error('[VsCodeExtension] Error handling EduSense session change:', error);
        }
      }
    });

    // Refresh index when branch is changed
    this.ide.getWorkspaceDirs().then((dirs) =>
      dirs.forEach(async (dir) => {
        const repo = await this.ide.getRepo(vscode.Uri.file(dir));
        if (repo) {
          repo.state.onDidChange(() => {
            // args passed to this callback are always undefined, so keep track of previous branch
            const currentBranch = repo?.state?.HEAD?.name;
            if (currentBranch) {
              if (this.PREVIOUS_BRANCH_FOR_WORKSPACE_DIR[dir]) {
                if (
                  currentBranch !== this.PREVIOUS_BRANCH_FOR_WORKSPACE_DIR[dir]
                ) {
                  // Trigger refresh of index only in this directory
                  this.core.invoke("index/forceReIndex", { dir });
                }
              }

              this.PREVIOUS_BRANCH_FOR_WORKSPACE_DIR[dir] = currentBranch;
            }
          });
        }
      }),
    );

    // Register a content provider for the readonly virtual documents
    const documentContentProvider = new (class
      implements vscode.TextDocumentContentProvider {
      // emitter and its event
      onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
      onDidChange = this.onDidChangeEmitter.event;

      provideTextDocumentContent(uri: vscode.Uri): string {
        return uri.query;
      }
    })();
    context.subscriptions.push(
      vscode.workspace.registerTextDocumentContentProvider(
        VsCodeExtension.continueVirtualDocumentScheme,
        documentContentProvider,
      ),
    );

    vscode.workspace.onDidCloseTextDocument(async () => {
      const openFiles = vscode.workspace.textDocuments;
      if (openFiles.length === 1) {
        // the count is amount of last open files
        this.sidebar.webviewProtocol.request("setActiveFilePath", "", [PEARAI_CHAT_VIEW_ID]);
      }
    });

    this.ide.onDidChangeActiveTextEditor((filepath) => {
      this.core.invoke("didChangeActiveTextEditor", { filepath });
      this.sidebar.webviewProtocol.request("setActiveFilePath", filepath, [PEARAI_CHAT_VIEW_ID]);
    });

    this.updateNewWindowActiveFilePath();

    // --- EduSense 커리큘럼 편집기에서 열기 명령어 등록 ---
    context.subscriptions.push(
      vscode.commands.registerCommand('edusense.openCurriculumInEditor', async () => {
        const column = vscode.window.activeTextEditor
          ? vscode.window.activeTextEditor.viewColumn
          : undefined;

        if (this.curriculumPanel) {
          this.curriculumPanel.reveal(column);
          return;
        }

        this.curriculumPanel = vscode.window.createWebviewPanel(
          'pearai.curriculum', // 웹뷰 타입 (기존 뷰 ID와 동일하게 유지)
          'EduSense', // 패널 제목 변경
          column || vscode.ViewColumn.One, // 표시할 열
          {
            enableScripts: true, // 스크립트 활성화
            retainContextWhenHidden: true, // 숨겨졌을 때 상태 유지
            localResourceRoots: [vscode.Uri.joinPath(this.extensionContext.extensionUri, 'gui')]
          }
        );

        const webviewProtocol = await this.getWebviewProtocol();
        if (webviewProtocol) {
          const panelId = this.curriculumPanel.viewType;
          webviewProtocol.addWebview(panelId, this.curriculumPanel.webview);
          console.log(`Webview panel added to protocol with ID: ${panelId}`);
        } else {
          console.warn("Webview protocol not available, panel cannot communicate effectively.");
        }

        this.curriculumPanel.webview.html = this.getWebviewContentForPanel(this.extensionContext, this.curriculumPanel);

        this.curriculumPanel.onDidDispose(
          () => { this.curriculumPanel = undefined; },
          null,
          this.extensionContext.subscriptions
        );
      })
    );
  }

  static continueVirtualDocumentScheme = "pearai";

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private PREVIOUS_BRANCH_FOR_WORKSPACE_DIR: { [dir: string]: string } = {};

  private async refreshContextProviders() {
    this.sidebar.webviewProtocol.request("refreshSubmenuItems", undefined); // Refresh all context providers
  }

  private async updateNewWindowActiveFilePath() {
    const currentFile = await this.ide.getCurrentFile();
    this.sidebar.webviewProtocol?.request("setActiveFilePath", currentFile, [PEARAI_CHAT_VIEW_ID]);
  }

  registerCustomContextProvider(contextProvider: IContextProvider) {
    this.configHandler.registerCustomContextProvider(contextProvider);
  }

  private async setupAuthListeners(): Promise<void> {
    // --- 추가된 로그 0 --- 
    console.log('[VsCodeExtension] setupAuthListeners FUNCTION CALLED.');

    this.extensionContext.subscriptions.push(
      this.eduSenseProvider.onDidChangeSessions(async (e) => {
        // --- 추가된 로그 1 ---
        console.log(`[VsCodeExtension] onDidChangeSessions HANDLER STARTED for ${AUTH_PROVIDER_ID}. Event:`, JSON.stringify(e, null, 2));

        try {
          // --- 추가된 로그 2 ---
          console.log('[VsCodeExtension] Attempting to get current session...');
          const currentSession = await vscode.authentication.getSession(AUTH_PROVIDER_ID, SCOPES, { createIfNone: false });
          // --- 추가된 로그 3 ---
          console.log(`[VsCodeExtension] Session check complete. Session ${currentSession ? 'exists' : 'does NOT exist'}.`);

          // --- sessionInfo 구성 (주석 제거 및 실제 로직 복원) ---
          const sessionInfo = currentSession
            ? {
              sessionId: currentSession.id,
              accessToken: currentSession.accessToken,
              account: {
                id: currentSession.account.id,
                label: currentSession.account.label,
              },
              providerId: AUTH_PROVIDER_ID
            }
            : undefined;
          // -------------------------------------------
          // --- 추가된 로그 4 ---
          console.log('[VsCodeExtension] Constructed sessionInfo:', sessionInfo);


          if (currentSession && sessionInfo) {
            console.log('[VsCodeExtension] Auth Listener: Handling existing session for', currentSession.account.label);

            try {
              // --- 추가된 로그 5 ---
              console.log('[VsCodeExtension] Awaiting webviewProtocolPromise...');
              const webviewProtocol = await this.webviewProtocolPromise;
              // --- 추가된 로그 6 ---
              console.log('[VsCodeExtension] webviewProtocolPromise resolved. Attempting to send message to webview...');
              // --- 추가 로그: 보내는 페이로드 확인 (세션 변경 시) ---
              console.log('[VsCodeExtension] Sending payload to webview (session changed):', { sessionInfo });
              // -----------------------------------------------
              webviewProtocol.request("didChangeControlPlaneSessionInfo", { sessionInfo });
              console.log('[VsCodeExtension] Sent didChangeControlPlaneSessionInfo to webview'); // <--- 원래 확인하려던 로그
            } catch (webviewError) {
              console.error('[VsCodeExtension] Error sending didChangeControlPlaneSessionInfo to webview:', webviewError);
            }

            // ... 코어 호출 및 나머지 로직 ...

          } else {
            console.log('[VsCodeExtension] Auth Listener: Handling no active session (logout or initial state).');

            try {
              // --- 추가된 로그 7 (else 블록) ---
              console.log('[VsCodeExtension] (else) Awaiting webviewProtocolPromise...');
              const webviewProtocol = await this.webviewProtocolPromise;
              // --- 추가된 로그 8 (else 블록) ---
              console.log('[VsCodeExtension] (else) webviewProtocolPromise resolved. Attempting to send undefined sessionInfo to webview...');
              // --- 추가 로그: 보내는 페이로드 확인 (세션 변경, else 블록) ---
              console.log('[VsCodeExtension] Sending undefined payload to webview (session changed):', { sessionInfo: undefined });
              // -------------------------------------------------------
              webviewProtocol.request("didChangeControlPlaneSessionInfo", { sessionInfo: undefined });
              console.log('[VsCodeExtension] Sent didChangeControlPlaneSessionInfo (undefined) to webview');
            } catch (webviewError) {
              console.error('[VsCodeExtension] Error sending didChangeControlPlaneSessionInfo (undefined) to webview:', webviewError);
            }

            // ... 코어 호출 및 나머지 로직 ...
          }

          // ... 나머지 로직 ...

        } catch (error: any) {
          // --- 추가된 로그 9 (catch 블록) ---
          console.error('[VsCodeExtension] Error INSIDE onDidChangeSessions handler:', error);
        }
      })
    );

    // --- Initial check 부분도 동일하게 수정 필요 ---
    console.log('[VsCodeExtension] Performing initial authentication check...');
    try {
      // 자동으로 로그인 시도하지 않고, 현재 세션만 조용히 확인
      const session = await vscode.authentication.getSession(AUTH_PROVIDER_ID, SCOPES, { createIfNone: false, silent: true });
      const initialSessionInfo = session
        ? { // 세션이 있으면 sessionInfo 구성
          sessionId: session.id,
          accessToken: session.accessToken,
          account: { id: session.account.id, label: session.account.label },
          providerId: AUTH_PROVIDER_ID
        }
        : undefined;
      console.log('[VsCodeExtension] Constructed initialSessionInfo:', initialSessionInfo);

      if (session && initialSessionInfo) { // 세션이 존재하면
        console.log('[VsCodeExtension] Initial auth check: Found active session for', session.account.label);

        // 1. 웹뷰 알림 <-- 여기가 초기 상태를 보내는 부분입니다
        try {
          const webviewProtocol = await this.webviewProtocolPromise;
          // --- 추가 로그: 보내는 페이로드 확인 ---
          console.log('[VsCodeExtension] Sending initial payload to webview:', { sessionInfo: initialSessionInfo });
          // -----------------------------------
          webviewProtocol.request("didChangeControlPlaneSessionInfo", { sessionInfo: initialSessionInfo });
          console.log('[VsCodeExtension] Sent initial didChangeControlPlaneSessionInfo to webview');
        } catch (webviewError) {
          console.error('[VsCodeExtension] Error sending initial didChangeControlPlaneSessionInfo to webview:', webviewError);
        }
        // 2. 코어 알림
        this.core?.invoke("didChangeControlPlaneSessionInfo", { sessionInfo: initialSessionInfo });
        console.log('[VsCodeExtension] Invoked initial didChangeControlPlaneSessionInfo on core');
        // 3. 코어 인증 정보 설정
        this.core?.invoke("llm/setPearAICredentials", { accessToken: session.accessToken });
        // 4. 웹뷰 로그인 상태
        this.sidebar.webviewProtocol?.request("pearAISignedIn", undefined, [PEARAI_CHAT_VIEW_ID, PEARAI_SEARCH_VIEW_ID, PEARAI_MEM0_VIEW_ID, PEARAI_CURRICULUM_VIEW_ID]);

      } else { // 초기 세션이 없으면
        console.log('[VsCodeExtension] Initial auth check: No active session found.');
        // ... 로그아웃 상태 처리 ...
      }
      // ...

    } catch (error: any) { // 초기 확인 중 오류 발생 시
      console.error('[VsCodeExtension] Error during initial silent auth check:', error);
      // ... 오류 처리 ...
    }
  }

  // 웹뷰 HTML 콘텐츠 생성 로직 (클래스 메서드로 정의)
  private getWebviewContentForPanel(context: vscode.ExtensionContext, panel: vscode.WebviewPanel): string {
    const extensionUri = getExtensionUri();
    const nonce = getNonce();
    let styleMainUri: string;
    let scriptUri: string;

    const inDevelopmentMode =
      context.extensionMode === vscode.ExtensionMode.Development;

    if (!inDevelopmentMode) {
      scriptUri = panel.webview
        .asWebviewUri(vscode.Uri.joinPath(extensionUri, "gui/assets/index.js"))
        .toString();
      styleMainUri = panel.webview
        .asWebviewUri(vscode.Uri.joinPath(extensionUri, "gui/assets/index.css"))
        .toString();
    } else {
      scriptUri = "http://localhost:5173/src/main.tsx";
      styleMainUri = "http://localhost:5173/src/index.css";
    }

    const currentTheme = getTheme();
    // windowId를 panel.viewType으로 사용 (고유성 확보)
    const windowId = panel.viewType; // 예: 'pearai.curriculum'
    const vscMediaUrl: string = panel.webview
      .asWebviewUri(vscode.Uri.joinPath(extensionUri, "gui"))
      .toString();

    const isFullScreen = false;
    const isOverlay = false;
    const initialRoute = "/education";

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">
          <meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp">
          <script>
            const vscode = acquireVsCodeApi();
          </script>
          <link href="${styleMainUri}" rel="stylesheet">
          <title>EduSense</title>
      </head>
      <body>
          <div id="root"></div>
          <div id="modal-root"></div>

          ${`<script>
          function log(level, ...args) {
            const text = args.map(arg =>
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            vscode.postMessage({ messageType: 'log', level, text, messageId: "log" });
          }

          window.console.log = (...args) => log('log', ...args);
          window.console.info = (...args) => log('info', ...args);
          window.console.warn = (...args) => log('warn', ...args);
          window.console.error = (...args) => log('error', ...args);
          window.console.debug = (...args) => log('debug', ...args);

          console.debug('Logging initialized for editor panel');
          </script>`}
          ${inDevelopmentMode
        ? /*html*/ `<script type="module">
            import RefreshRuntime from "http://localhost:5173/@react-refresh"
            RefreshRuntime.injectIntoGlobalHook(window)
            window.$RefreshReg$ = () => {}
            window.$RefreshSig$ = () => (type) => type
            window.__vite_plugin_react_preamble_installed__ = true
            </script>`
        : /*html*/ ""
      }

          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>

          <script>localStorage.setItem("ide", '"vscode"')</script>
          <script>localStorage.setItem("extensionVersion", '"${getExtensionVersion()}"')</script>
          <script>window.windowId = "${windowId}"</script>
          <script>window.vscMachineId = "${getUniqueId()}"</script>
          <script>window.vscMediaUrl = "${vscMediaUrl}"</script>
          <script>window.ide = "vscode"</script>
          <script>window.fullColorTheme = ${JSON.stringify(currentTheme)}</script>
          <script>window.colorThemeName = "dark-plus"</script> // TODO: 실제 테마 이름 동적 반영?
          <script>window.workspacePaths = ${JSON.stringify(
        vscode.workspace.workspaceFolders?.map(
          (folder) => folder.uri.fsPath,
        ) || [],
      )}</script>
          <script>window.isFirstLaunch = ${isFirstLaunch(context)}</script>
          <script>window.isFullScreen = ${isFullScreen}</script>
          <script>window.viewType = "${panel.viewType}"</script>
          <script>window.isPearOverlay = ${isOverlay}</script>
          <script>window.initialRoute = "${initialRoute}"</script>

          <!-- 에디터 패널에는 edits가 필요 없을 수 있음 -->

      </body>
      </html>`;
  }

  public getIde(): VsCodeIde {
    return this.ide;
  }

  public async getWebviewProtocol(): Promise<VsCodeWebviewProtocol | undefined> {
    try {
      return await this.webviewProtocolPromise;
    } catch (error) {
      console.error("Error resolving webviewProtocolPromise:", error);
      return undefined;
    }
  }
}
