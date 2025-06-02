import { FromWebviewProtocol, ToWebviewProtocol } from "core/protocol";
import { Message } from "core/util/messenger";
import fs from "node:fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import * as vscode from "vscode";
import { IMessenger } from "../../../core/util/messenger";
import { getExtensionUri } from "./util/vscode";

// VSCode 테마 타입 정의
export type VSCodeThemeInfo = {
  kind: 'light' | 'dark' | 'high-contrast';
  colors: Record<string, string>;
};

// 현재 VSCode 테마 정보 가져오기
export function getVSCodeThemeInfo(): VSCodeThemeInfo {
  const workbenchColorCustomizations = vscode.workspace.getConfiguration('workbench').get('colorCustomizations');
  const kind = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light
    ? 'light'
    : vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark
      ? 'dark'
      : 'high-contrast';

  return {
    kind,
    colors: workbenchColorCustomizations as Record<string, string> || {}
  };
}

export async function showTutorial() {
  const tutorialPath = path.join(
    getExtensionUri().fsPath,
    "pearai_tutorial.py",
  );
  // Ensure keyboard shortcuts match OS
  if (process.platform !== "darwin") {
    let tutorialContent = fs.readFileSync(tutorialPath, "utf8");
    tutorialContent = tutorialContent
      .replaceAll("⌘", "^")
      .replaceAll("Cmd", "Ctrl");
    fs.writeFileSync(tutorialPath, tutorialContent);
  }

  const doc = await vscode.workspace.openTextDocument(
    vscode.Uri.file(tutorialPath),
  );
  await vscode.window.showTextDocument(doc, { preview: false });
}

export class VsCodeWebviewProtocol
  implements IMessenger<FromWebviewProtocol, ToWebviewProtocol> {
  listeners = new Map<
    keyof FromWebviewProtocol,
    ((message: Message) => any)[]
  >();

  // 테마 변경 이벤트 구독
  private themeChangeSubscription: vscode.Disposable | null = null;

  // 웹뷰에 테마 정보 전송
  sendThemeInfo(specificWebviews?: string[]) {
    try {
      const themeInfo = getVSCodeThemeInfo();
      console.log(`[THEME] 테마 정보 전송: ${themeInfo.kind}`);

      // 새로운 형식 (messageType 사용)
      this.send('theme-changed', themeInfo, undefined, specificWebviews);

      // 이전 형식과의 호환성을 위한 메시지도 전송 (type 사용)
      if (specificWebviews) {
        specificWebviews.forEach(name => {
          try {
            const webview = this.webviews.get(name);
            if (webview) {
              webview.postMessage({
                type: 'theme-changed',
                theme: themeInfo.kind,
                messageId: uuidv4()
              });
            }
          } catch (error) {
            console.error(`[ERROR] 이전 형식 테마 메시지 전송 실패 (${name}):`, error);
          }
        });
      } else {
        this.webviews.forEach(webview => {
          try {
            webview.postMessage({
              type: 'theme-changed',
              theme: themeInfo.kind,
              messageId: uuidv4()
            });
          } catch (error) {
            console.error('[ERROR] 이전 형식 테마 메시지 전송 실패:', error);
          }
        });
      }
    } catch (error) {
      console.error('[ERROR] 테마 정보 전송 중 오류:', error);
    }
  }

  // 테마 변경 구독 시작
  startThemeChangeSubscription() {
    try {
      if (!this.themeChangeSubscription) {
        this.themeChangeSubscription = vscode.window.onDidChangeActiveColorTheme((colorTheme) => {
          console.log(`[THEME] VSCode 테마 변경 감지: ${colorTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'light'}`);

          // 약간의 지연을 주어 VSCode가 테마를 완전히 적용할 시간을 줌
          setTimeout(() => {
            this.sendThemeInfo();
          }, 100);
        });
        console.log('[INFO] 테마 변경 이벤트 구독 시작');
      }
    } catch (error) {
      console.error('[ERROR] 테마 변경 이벤트 구독 실패:', error);
    }
  }

  // 테마 변경 구독 중지
  stopThemeChangeSubscription() {
    try {
      if (this.themeChangeSubscription) {
        this.themeChangeSubscription.dispose();
        this.themeChangeSubscription = null;
        console.log('[INFO] 테마 변경 이벤트 구독 중지');
      }
    } catch (error) {
      console.error('[ERROR] 테마 변경 이벤트 구독 중지 중 오류:', error);
    }
  }

  send(messageType: string, data: any, messageId?: string, specificWebviews?: string[],
  ): string {
    const id = messageId ?? uuidv4();
    if (specificWebviews) {
      specificWebviews.forEach(name => {
        try {
          const webview = this.webviews.get(name);
          if (webview) {
            webview.postMessage({
              messageType,
              data,
              messageId: id,
            });
          }

        } catch (error) {
          console.error(`Failed to post message to webview ${name}:`, error);
        }
      });
    } else {
      this.webviews.forEach(webview => {
        webview.postMessage({
          messageType,
          data,
          messageId: id,
        });
      });
    }
    return id;
  }

  on<T extends keyof FromWebviewProtocol>(
    messageType: T,
    handler: (
      message: Message<FromWebviewProtocol[T][0]>,
    ) => Promise<FromWebviewProtocol[T][1]> | FromWebviewProtocol[T][1],
  ): void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, []);
    }
    this.listeners.get(messageType)?.push(handler);
  }

  _webviews: Map<string, vscode.Webview> = new Map();
  _webviewListeners: Map<string, vscode.Disposable> = new Map();

  get webviews(): Map<string, vscode.Webview> {
    return this._webviews;
  }
  resetWebviews() {
    // 모든 웹뷰 리스너 정리
    this._webviewListeners.forEach((listener) => listener.dispose());
    this._webviewListeners.clear();

    // 테마 변경 이벤트 구독 정리
    this.stopThemeChangeSubscription();

    this._webviews.clear();
  }

  resetWebviewToDefault() {
    const defaultViewKey = "pearai.chatView";

    // Remove all entries except for the chat view
    this._webviews.forEach((value, key) => {
      if (key !== defaultViewKey) {
        this._webviews.delete(key);
      }
    });

    // Dispose and remove all listeners except for the chat view
    this._webviewListeners.forEach((listener, key) => {
      if (key !== defaultViewKey) {
        listener.dispose();
        this._webviewListeners.delete(key);
      }
    });
  }

  addWebview(viewType: string, webView: vscode.Webview) {
    console.log(`[VsCodeWebviewProtocol addWebview] Called for viewType: ${viewType}`);

    const existingListener = this._webviewListeners.get(viewType);
    if (existingListener) {
      console.log(`[VsCodeWebviewProtocol addWebview] Disposing existing listener for viewType: ${viewType}`);
      existingListener.dispose();
      this._webviewListeners.delete(viewType);
    }

    this._webviews.set(viewType, webView);
    const listener = webView.onDidReceiveMessage(async (msg) => {
      if (msg.messageType === "addEducationContextToChat") {
        console.log(`[VsCodeWebviewProtocol onDidReceiveMessage] Received 'addEducationContextToChat', ID: ${msg.messageId}`);
      }

      if (!msg.messageType || !msg.messageId) {
        throw new Error(`Invalid webview protocol msg: ${JSON.stringify(msg)}`);
      }

      const respond = (message: any) =>
        this.send(msg.messageType, message, msg.messageId);

      const handlers = this.listeners.get(msg.messageType) || [];
      for (const handler of handlers) {
        try {
          const response = await handler(msg);
          if (
            response &&
            typeof response[Symbol.asyncIterator] === "function"
          ) {
            let next = await response.next();
            while (!next.done) {
              respond(next.value);
              next = await response.next();
            }
            respond({ done: true, content: next.value?.content });
          } else {
            respond(response || {});
          }
        } catch (e: any) {
          respond({ done: true, error: e });

          console.error(
            `Error handling webview message: ${JSON.stringify(
              { msg },
              null,
              2,
            )}\n\n${e}`,
          );

          let message = e.message;

          if (e.cause) {
            if (e.cause.name === "ConnectTimeoutError") {
              message = `Connection timed out. If you expect it to take a long time to connect, you can increase the timeout in config.json by setting "requestOptions": { "timeout": 10000 }. You can find the full config reference here: https://trypear.ai/reference/config`;
            } else if (e.cause.code === "ECONNREFUSED") {
              message = `Connection was refused. This likely means that there is no server running at the specified URL. If you are running your own server you may need to set the "apiBase" parameter in config.json. For example, you can set up an OpenAI-compatible server like here: https://trypear.ai/reference/Model%20Providers/openai#openai-compatible-servers--apis`;
            } else {
              message = `The request failed with "${e.cause.name}": ${e.cause.message}. If you're having trouble setting up PearAI, please see the troubleshooting guide for help.`;
            }
          }
          // PearAI login issues
          else if (message.includes("401") && message.includes("PearAI")) {
            vscode.window
              .showErrorMessage(
                message,
                'Login to PearAI',
                'Show Logs',
              )
              .then((selection) => {
                if (selection === 'Login to PearAI') {
                  // Execute the login command which uses EduSenseProvider
                  vscode.commands.executeCommand('pearai.login');
                } else if (selection === 'Show Logs') {
                  vscode.commands.executeCommand(
                    'workbench.action.toggleDevTools',
                  );
                }
              });
          }
          // PearAI Free trial ended case
          else if (message.includes("403") && message.includes("PearAI")) {
            vscode.window
              .showErrorMessage(
                message,
                'View PearAI Pricing',
                'Show Logs',
              )
              .then((selection) => {
                if (selection === 'View PearAI Pricing') {
                  // Redirect to auth login URL
                  vscode.env.openExternal(
                    vscode.Uri.parse(
                      'https://trypear.ai/pricing',
                    ),
                  );
                } else if (selection === 'Show Logs') {
                  vscode.commands.executeCommand(
                    'workbench.action.toggleDevTools',
                  );
                }
              });
          }
          else if (message.includes("https://proxy-server")) {
            message = message.split("\n").filter((l: string) => l !== "")[1];
            try {
              message = JSON.parse(message).message;
            } catch { }
            if (message.includes("exceeded")) {
              message +=
                " To keep using PearAI, you can set up a local model or use your own API key.";
            }

            vscode.window
              .showInformationMessage(message, "Add API Key", "Use Local Model")
              .then((selection) => {
                if (selection === "Add API Key") {
                  this.request("addApiKey", undefined);
                } else if (selection === "Use Local Model") {
                  this.request("setupLocalModel", undefined);
                }
              });
          } else if (message.includes("Please sign in with GitHub")) {
            vscode.window
              .showInformationMessage(
                message,
                "Sign In",
                "Use API key / local model",
              )
              .then((selection) => {
                if (selection === "Sign In") {
                  vscode.authentication
                    .getSession("github", [], {
                      createIfNone: true,
                    })
                    .then(() => {
                      this.reloadConfig();
                    });
                } else if (selection === "Use API key / local model") {
                  this.request("openOnboarding", undefined);
                }
              });
          } else {
            vscode.window
              .showErrorMessage(
                message,
                "Show Logs",
                "Troubleshooting",
              )
              .then((selection) => {
                if (selection === "Show Logs") {
                  vscode.commands.executeCommand(
                    "workbench.action.toggleDevTools",
                  );
                } else if (selection === "Troubleshooting") {
                  vscode.env.openExternal(
                    vscode.Uri.parse(
                      "https://trypear.ai/troubleshooting",
                    ),
                  );
                }
              });
          }
        }
      }
    });
    this._webviewListeners.set(viewType, listener);

    // 웹뷰가 모두 제거된 경우 테마 변경 이벤트 구독 정리
    if (this._webviews.size === 0) {
      this.stopThemeChangeSubscription();
    }
  }

  removeWebview(name: string) {
    const listener = this._webviewListeners.get(name);
    if (listener) {
      listener.dispose();
      this._webviewListeners.delete(name);
    }
    this._webviews.delete(name);

    // 웹뷰가 모두 제거된 경우 테마 변경 이벤트 구독 정리
    if (this._webviews.size === 0) {
      this.stopThemeChangeSubscription();
    }
  }

  constructor(private readonly reloadConfig: () => void) {
    // 테마 변경 이벤트 구독 시작
    this.startThemeChangeSubscription();
  }

  invoke<T extends keyof FromWebviewProtocol>(
    messageType: T,
    data: FromWebviewProtocol[T][0],
    messageId?: string,
  ): FromWebviewProtocol[T][1] {
    throw new Error("Method not implemented.");
  }

  onError(handler: (error: Error) => void): void {
    throw new Error("Method not implemented.");
  }

  public request<T extends keyof ToWebviewProtocol>(
    messageType: T,
    data: ToWebviewProtocol[T][0],
    specificWebviews?: string[]
  ): Promise<ToWebviewProtocol[T][1]> {
    const messageId = uuidv4();
    return new Promise(async (resolve) => {
      let i = 0;
      while (this.webviews.size === 0) {
        if (i >= 10) {
          resolve(undefined);
          return;
        } else {
          await new Promise((res) => setTimeout(res, i >= 5 ? 1000 : 500));
          i++;
        }
      }

      this.send(messageType, data, messageId, specificWebviews);
      const disposables: vscode.Disposable[] = [];
      this.webviews.forEach((webview, name) => {
        const disposable = webview.onDidReceiveMessage(
          (msg: Message<ToWebviewProtocol[T][1]>) => {
            if (msg.messageId === messageId) {
              resolve(msg.data);
              disposables.forEach(d => d.dispose());
            }
          }
        );
        disposables.push(disposable);
      });
    });
  }
}
