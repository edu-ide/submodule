import type { FileEdit } from "core";
import { ConfigHandler } from "core/config/ConfigHandler";
import { getTheme, getThemeType } from "./util/getTheme";
import * as vscode from "vscode";
import { getExtensionVersion } from "./util/util";
import { getExtensionUri, getNonce, getUniqueId } from "./util/vscode";
import { VsCodeWebviewProtocol, getVSCodeThemeInfo } from "./webviewProtocol";
import { isFirstLaunch } from "./copySettings";
import { PEARAI_CHAT_VIEW_ID, PEARAI_OVERLAY_VIEW_ID } from "./util/pearai/pearaiViewTypes";

// The overlay's webview title/id is defined in pearai-app's PearOverlayParts.ts
// A unique identifier is needed for the messaging protocol to distinguish the webviews.

export class ContinueGUIWebviewViewProvider
  implements vscode.WebviewViewProvider {
  public static readonly viewType = PEARAI_CHAT_VIEW_ID;
  public webviewProtocol: VsCodeWebviewProtocol;
  private _webview?: vscode.Webview;
  private _webviewView?: vscode.WebviewView;
  private outputChannel: vscode.OutputChannel;
  private enableDebugLogs: boolean;
  private disposables: vscode.Disposable[] = [];
  private resolveWebviewProtocol: (protocol: VsCodeWebviewProtocol) => void;

  private updateDebugLogsStatus() {
    const settings = vscode.workspace.getConfiguration("pearai");
    this.enableDebugLogs = settings.get<boolean>("enableDebugLogs", false);
    if (this.enableDebugLogs) {
      this.outputChannel.show(true);
    } else {
      this.outputChannel.hide();
    }
  }

  // Show or hide the output channel on enableDebugLogs
  private setupDebugLogsListener() {
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("pearai.enableDebugLogs")) {
        const settings = vscode.workspace.getConfiguration("pearai");
        const enableDebugLogs = settings.get<boolean>("enableDebugLogs", false);
        if (enableDebugLogs) {
          this.outputChannel.show(true);
        } else {
          this.outputChannel.hide();
        }
      }
    });
  }

  // 웹뷰가 준비되면 테마 정보 전송
  private setupThemeListener() {
    // 웹뷰가 준비되면 테마 정보를 전송
    if (this._webview) {
      try {
        // 테마 변경 이벤트 구독 시작
        this.webviewProtocol.startThemeChangeSubscription();

        // 현재 테마 정보 즉시 전송
        this.webviewProtocol.sendThemeInfo();

        this.outputChannel.appendLine(`[INFO] 웹뷰 테마 리스너 설정 완료`);
      } catch (error) {
        this.outputChannel.appendLine(`[ERROR] 웹뷰 테마 리스너 설정 실패: ${error}`);
      }
    }
  }

  private async handleWebviewMessage(message: any) {
    try {
      if (message.messageType === "log") {
        const settings = vscode.workspace.getConfiguration("pearai");
        const enableDebugLogs = settings.get<boolean>("enableDebugLogs", false);

        if (message.level === "debug" && !enableDebugLogs) {
          return; // Skip debug logs if enableDebugLogs is false
        }

        const timestamp = new Date().toISOString().split(".")[0];
        const logMessage = `[${timestamp}] [${message.level.toUpperCase()}] ${message.text}`;
        this.outputChannel.appendLine(logMessage);
      }
      // 새 형식 테마 요청 (messageType 사용)
      else if (message.messageType === "request-theme") {
        // 테마 정보 요청 처리
        if (this._webview) {
          this.outputChannel.appendLine(`[INFO] 웹뷰에서 테마 정보 요청 수신 (messageType)`);
          this.webviewProtocol.sendThemeInfo();
        }
      }
      // 이전 형식 테마 요청 (type 사용)
      else if (message.type === "request-theme") {
        if (this._webview) {
          this.outputChannel.appendLine(`[INFO] 웹뷰에서 테마 정보 요청 수신 (type)`);
          this.webviewProtocol.sendThemeInfo();
        }
      }
      else {
      }
    } catch (error) {
      this.outputChannel.appendLine(`[ERROR] 웹뷰 메시지 처리 중 오류: ${error}`);
    }
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void | Thenable<void> {
    try {
      this._webviewView = webviewView;

      // 웹뷰 옵션 설정
      webviewView.webview.options = this.getWebviewOptions(webviewView.webview);

      // 웹뷰 메시지 핸들러 등록
      const messageListener = webviewView.webview.onDidReceiveMessage(
        this.handleWebviewMessage.bind(this)
      );
      this.disposables.push(messageListener);

      // HTML 내용 설정
      webviewView.webview.html = this.getSidebarContent(
        this.extensionContext,
        webviewView
      );

      this._webview = webviewView.webview;
      this.webviewProtocol.addWebview(ContinueGUIWebviewViewProvider.viewType, webviewView.webview);

      // webviewProtocol이 준비되었으므로 Promise를 resolve합니다.
      this.resolveWebviewProtocol(this.webviewProtocol);
      this.outputChannel.appendLine(`[INFO] webviewProtocolPromise resolved.`);

      // 웹뷰가 준비되면 테마 리스너 설정
      this.setupThemeListener();

      this.outputChannel.appendLine(`[INFO] 웹뷰 초기화 완료: ${ContinueGUIWebviewViewProvider.viewType}`);
    } catch (error) {
      this.outputChannel.appendLine(`[ERROR] 웹뷰 초기화 중 오류: ${error}`);
      throw error; // VSCode에 오류를 보고
    }
  }

  get isVisible() {
    return this._webviewView?.visible;
  }

  get webview() {
    return this._webview;
  }

  /**
   * 웹뷰의 옵션을 구성하는 메서드
   * @param webview 설정할 웹뷰
   * @returns 웹뷰 옵션
   */
  private getWebviewOptions(webview: vscode.Webview): vscode.WebviewOptions {
    const extensionUri = getExtensionUri();
    return {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(extensionUri, "gui"),
        vscode.Uri.joinPath(extensionUri, "assets"),
      ],
      enableCommandUris: true,
      portMapping: [
        {
          webviewPort: 65433,
          extensionHostPort: 65433,
        },
      ],
    };
  }

  public resetWebviewProtocolWebview(): void {
    if (this._webview) {
      this.webviewProtocol.resetWebviewToDefault()
    } else {
      console.warn("no webview found during reset");
    }
  }

  sendMainUserInput(input: string) {
    this.webview?.postMessage({
      type: "userInput",
      input,
    });
  }

  constructor(
    private readonly configHandlerPromise: Promise<ConfigHandler>,
    private readonly windowId: string,
    private readonly extensionContext: vscode.ExtensionContext,
    resolveWebviewProtocol: (protocol: VsCodeWebviewProtocol) => void
  ) {
    this.outputChannel = vscode.window.createOutputChannel("PearAI");
    this.enableDebugLogs = false;
    this.updateDebugLogsStatus();
    this.setupDebugLogsListener();
    this.resolveWebviewProtocol = resolveWebviewProtocol;

    this.webviewProtocol = new VsCodeWebviewProtocol(
      (async () => {
        const configHandler = await this.configHandlerPromise;
        return configHandler.reloadConfig();
      }).bind(this),
    );

    // 테마 변경 이벤트 리스너를 여기서 한 번만 설정
    const themeChangeListener = vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.colorTheme")) {
        // 디버깅 중에 테마 변경 로그 추가
        this.outputChannel.appendLine(`[THEME] 테마 변경 감지: ${getTheme()}`);

        try {
          // 안전하게 테마 변경 메시지 전송
          this.webviewProtocol?.request("setTheme", { theme: getTheme() });
          this.webviewProtocol?.request("setThemeType", { themeType: getThemeType() });
        } catch (error) {
          this.outputChannel.appendLine(`[ERROR] 테마 변경 처리 중 오류: ${error}`);
        }
      }
    });

    // 이벤트 리스너를 disposables 배열에 추가
    this.disposables.push(themeChangeListener);
  }

  // 클래스 정리 메서드 추가
  public dispose() {
    // 모든 이벤트 리스너 정리
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];

    // 웹뷰 프로토콜 정리
    this.webviewProtocol.resetWebviews();

    // 출력 채널 정리
    this.outputChannel.dispose();
  }

  getSidebarContent(
    context: vscode.ExtensionContext | undefined,
    panel: vscode.WebviewPanel | vscode.WebviewView,
    page: string | undefined = undefined,
    edits: FileEdit[] | undefined = undefined,
    isFullScreen = false,
    initialRoute: string = "/"
  ): string {
    const panelViewType = panel?.viewType; // eg. pearai.chatView
    const isOverlay = panel?.title === PEARAI_OVERLAY_VIEW_ID; // defined in pearai-app PearOverlayPart.ts
    const extensionUri = getExtensionUri();
    let scriptUri: string;
    let styleMainUri: string;
    const vscMediaUrl: string = panel.webview
      .asWebviewUri(vscode.Uri.joinPath(extensionUri, "gui"))
      .toString();

    const inDevelopmentMode =
      context?.extensionMode === vscode.ExtensionMode.Development;
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

    const nonce = getNonce();

    const currentTheme = getTheme();
    // 테마 변경 이벤트 리스너를 여기서 설정하지 않음

    this.webviewProtocol.addWebview(panel?.title === PEARAI_OVERLAY_VIEW_ID ? panel.title : panel.viewType, panel.webview);

    // 커리큘럼 웹뷰일 경우 초기 경로를 /education으로 설정
    if (panelViewType === "pearai.curriculum") {
      initialRoute = "/education";
    }

    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">
        <meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp">
        <script>
          // VSCode API 초기화 및 전역 객체 설정
          try {
            const vscode = acquireVsCodeApi();
            window.vscode = vscode;
            window.vscodeApi = vscode;
            window.ide = 'vscode';
            console.log('[VSCode Extension] Successfully initialized VSCode API');
          } catch (error) {
            console.error('[VSCode Extension] Failed to initialize VSCode API:', error);
          }
        </script>
        <link href="${styleMainUri}" rel="stylesheet">

        <title>PearAI</title>
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

        console.debug('Logging initialized');
        </script>`}
        ${inDevelopmentMode
        ? `<script type="module">
          import RefreshRuntime from "http://localhost:5173/@react-refresh"
          RefreshRuntime.injectIntoGlobalHook(window)
          window.$RefreshReg$ = () => {}
          window.$RefreshSig$ = () => (type) => type
          window.__vite_plugin_react_preamble_installed__ = true
          </script>`
        : ""
      }

        <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        <script nonce="${nonce}">
          // 디버깅을 위한 임시 코드
          window.addEventListener('error', (event) => {
            console.error('Script loading error:', event.message, event.filename);
            vscode.postMessage({ 
              messageType: 'log', 
              level: 'error', 
              text: 'Script loading error: ' + event.message + ' at ' + event.filename,
              messageId: "error"
            });
          });
          
          // 페이지 로드 확인
          window.addEventListener('load', () => {
            console.log('Webview loaded successfully');
            vscode.postMessage({ 
              messageType: 'log', 
              level: 'info', 
              text: 'Webview page loaded',
              messageId: "load"
            });
          });
        </script>

        <script>localStorage.setItem("ide", '"vscode"')</script>
        <script>localStorage.setItem("extensionVersion", '"${getExtensionVersion()}"')</script>
        <script>window.windowId = "${this.windowId}"</script>
        <script>window.vscMachineId = "${getUniqueId()}"</script>
        <script>window.vscMediaUrl = "${vscMediaUrl}"</script>
        <script>window.ide = "vscode"</script>
        <script>window.fullColorTheme = ${JSON.stringify(currentTheme)}</script>
        <script>window.colorThemeName = "dark-plus"</script>
        <script>window.workspacePaths = ${JSON.stringify(
        vscode.workspace.workspaceFolders?.map(
          (folder) => folder.uri.fsPath,
        ) || [],
      )}</script>
        <script>window.isFirstLaunch = ${isFirstLaunch(this.extensionContext)}</script>
        <script>window.isFullScreen = ${isFullScreen}</script>
        <script>window.viewType = "${panelViewType}"</script>
        <script>window.isPearOverlay = ${isOverlay}</script>
        <script>window.initialRoute = "${initialRoute}"</script>

        ${edits
        ? `<script>window.edits = ${JSON.stringify(edits)}</script>`
        : ""
      }
        ${page ? `<script>window.location.pathname = "${page}"</script>` : ""}
      </body>
      ${isOverlay ? `
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: transparent;
              width: 100vw;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              position: fixed;
              top: 0;
              left: 0;
            }

            #root {
              width: 100%;
              height: 100%;
            }
          </style>
          <script>
            document.body.addEventListener('click', function(e) {
                if (e.target === document.body) {
                    vscode.postMessage({ messageType: 'closeOverlay', messageId: "closeOverlay" });
                    vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
                }
            });
          </script>
      `: ""}
    </html>`;
  }
}
