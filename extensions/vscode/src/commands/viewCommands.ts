import * as vscode from 'vscode';
import { getExtensionUri, getNonce, getUniqueId } from '../util/vscode';
import { getTheme } from '../util/getTheme';
import { getExtensionVersion } from '../util/util';
import { isFirstLaunch } from "../copySettings";
import type { VsCodeWebviewProtocol } from '../webviewProtocol';

// 활성 웹뷰 패널 참조를 저장하기 위한 변수 (모듈 스코프)
let curriculumPanel: vscode.WebviewPanel | undefined = undefined;

export function registerViewCommands(
    context: vscode.ExtensionContext,
    webviewProtocol: VsCodeWebviewProtocol | undefined
) {
    console.log('[viewCommands.ts] webviewProtocol received:', webviewProtocol);

    // 커리큘럼 뷰 토글 명령어
    context.subscriptions.push(
        vscode.commands.registerCommand('pearai.toggleCurriculum', () => {
            // 커리큘럼 뷰 토글 로직
            // workbench.view.extension.pearai-curriculum ID는 package.json에 정의된 container ID
            vscode.commands.executeCommand('workbench.view.pearai-curriculum'); // Note: view ID가 아니라 container ID일 수 있음, 확인 필요
        })
    );

    // 커리큘럼 뷰 포커스 명령어
    context.subscriptions.push(
        vscode.commands.registerCommand('pearai.focusCurriculum', () => {
            // 커리큘럼 뷰에 포커스
            // pearai.curriculum.focus ID는 package.json에 정의된 view ID
            vscode.commands.executeCommand('pearai.curriculum.focus');
        })
    );

    // 파일 탐색기 토글 명령어
    context.subscriptions.push(
        vscode.commands.registerCommand('pearai.toggleFileExplorer', () => {
            vscode.commands.executeCommand('workbench.view.explorer');
        })
    );
}

// 웹뷰 HTML 콘텐츠를 가져오는 함수 (getSidebarContent 로직 기반)
// 이 함수는 별도 유틸리티 파일로 이동하거나 삭제될 예정입니다.
function getWebviewContent(context: vscode.ExtensionContext, panel: vscode.WebviewPanel): string {
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

    const currentTheme = getTheme(); // 현재 테마 가져오기
    // TODO: windowId는 어떻게 가져올지 확인 필요. 일단 임시값 사용.
    const windowId = "editor-panel-window"; // 임시 ID
    const vscMediaUrl: string = panel.webview
        .asWebviewUri(vscode.Uri.joinPath(extensionUri, "gui"))
        .toString();

    // 에디터 탭이므로 isFullScreen=false, isOverlay=false
    const isFullScreen = false;
    const isOverlay = false;
    const initialRoute = "/education"; // 커리큘럼 초기 경로

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
        <script>window.windowId = "${panel.viewType}"</script> // viewType을 windowId로 사용
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
        <script>window.viewType = "${panel.viewType}"</script> // panel.viewType 사용
        <script>window.isPearOverlay = ${isOverlay}</script>
        <script>window.initialRoute = "${initialRoute}"</script>

        <!-- 에디터 패널에는 edits가 필요 없을 수 있음 -->

    </body>
    </html>`;
} 