/**
 * This is the entry point for the extension.
 *
 * Note: This file has been significantly modified from its original contents. pearai-submodule is a fork of Continue (https://github.com/continuedev/continue).
 */

import { setupCa } from "core/util/ca";
import { Telemetry } from "core/util/posthog";
import * as vscode from "vscode";
import { getExtensionVersion } from "./util/util";
import { MemFS } from './memFS';
import { promisify } from 'util';
// 새로 분리한 Provider import
// import { EduSensePracticeViewProvider } from './viewProviders/eduSensePracticeViewProvider';
import { PracticeExplorerProvider } from './viewProviders/practiceExplorerProvider';
import { registerMemFSCommands } from './commands/memfsCommands';
import { registerViewCommands } from './commands/viewCommands';
import { registerPracticeCommands } from './commands/practiceCommands';
import { VsCodeExtension } from './extension/VsCodeExtension'; // VsCodeExtension 타입 import 확인
const pipeline = promisify(require('stream').pipeline);

async function dynamicImportAndActivate(context: vscode.ExtensionContext) {
  const { activateExtension } = await import("./activation/activate");
  try {
    return activateExtension(context);
  } catch (e) {
    console.log("Error activating extension: ", e);
    vscode.window
      .showInformationMessage(
        "Error activating the PearAI extension.",
        "View Logs",
        "Retry",
      )
      .then((selection) => {
        if (selection === "View Logs") {
          vscode.commands.executeCommand("pearai.viewLogs");
        } else if (selection === "Retry") {
          // Reload VS Code window
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      });
  }
}

export async function activate(context: vscode.ExtensionContext) {
  setupCa();
  const extensionApi: { extension: VsCodeExtension } | undefined = await dynamicImportAndActivate(context) as any;
  const vscodeExtension = extensionApi?.extension;

  // --- getWebviewProtocol() 호출 시 await 추가 ---
  const webviewProtocol = vscodeExtension ? await vscodeExtension.getWebviewProtocol() : undefined;
  // -----------------------------------------
  console.log(`[extension.ts] WebviewProtocol instance obtained via getWebviewProtocol(): ${webviewProtocol ? 'Yes' : 'No'}`);

  // MemFS 인스턴스 생성
  const memFs = new MemFS();

  // 파일 시스템 제공자 등록
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider('memfs', memFs, {
      isCaseSensitive: true
    })
  );

  // --- EduSense 실습 파일 탐색기 (TreeView) 등록 ---
  const workspaceRootUri = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
    ? vscode.workspace.workspaceFolders[0].uri
    : undefined;
  const practiceExplorerProvider = new PracticeExplorerProvider(workspaceRootUri);
  console.log('[extension.ts] Registering practice-explorer TreeDataProvider...');
  const practiceExplorerDisposable = vscode.window.registerTreeDataProvider('practice-explorer', practiceExplorerProvider);
  context.subscriptions.push(practiceExplorerDisposable);
  console.log('[extension.ts] practice-explorer TreeDataProvider registered successfully.');

  // --- 분리된 파일에서 명령어 등록 함수 호출 ---
  registerMemFSCommands(context, memFs);     // MemFS 관련 명령어 등록
  // registerViewCommands 호출 시 webviewProtocol 전달
  registerViewCommands(context, webviewProtocol); // webviewProtocol 전달 (undefined일 수 있음)
  if (vscodeExtension) {
    registerPracticeCommands(context, vscodeExtension.getIde());      // 실습 관련 명령어 등록
  }
  // -----------------------------------------

  // --- 초기 실습 폴더 존재 여부 확인 및 Context Key 설정 ---
  if (workspaceRootUri) {
    const practiceFolderUri = vscode.Uri.joinPath(workspaceRootUri, 'edusense.practice');
    try {
      await vscode.workspace.fs.stat(practiceFolderUri);
      // 폴더가 존재하면 Context Key를 true로 설정
      vscode.commands.executeCommand('setContext', 'edusense:practiceFolderVisible', true);
      console.log('Initial practice folder found. Setting context key to true.');
    } catch (error) {
      // 폴더가 없으면 Context Key를 false로 설정 (또는 기본값 유지)
      vscode.commands.executeCommand('setContext', 'edusense:practiceFolderVisible', false);
      console.log('Initial practice folder not found. Setting context key to false.');
    }
  } else {
    // 워크스페이스가 없으면 false
    vscode.commands.executeCommand('setContext', 'edusense:practiceFolderVisible', false);
  }
  // --------------------------------------------------

  console.log("PearAI extension core components activated.");

  // --- 확장 기능 활성화 시 EduSense 패널 포커스 --- 
  try {
    // 약간의 지연 후 포커스 (UI가 완전히 로드될 시간을 줌)
    setTimeout(() => {
      vscode.commands.executeCommand('workbench.view.pearaiCurriculum');
      console.log('Attempting to focus EduSense panel on activation.');
    }, 1500); // 지연 시간 늘리기 (500ms -> 1500ms)
  } catch (focusError) {
    console.error("Failed to focus EduSense panel on activation:", focusError);
  }
  // ------------------------------------------------
  
  return extensionApi;
}

export function deactivate() {
  Telemetry.capture(
    "deactivate",
    {
      extensionVersion: getExtensionVersion(),
    },
    true,
  );

  Telemetry.shutdownPosthogClient();
}