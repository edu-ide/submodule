/**
 * This is the entry point for the extension.
 *
 * Note: This file has been significantly modified from its original contents. pearai-submodule is a fork of Continue (https://github.com/continuedev/continue).
 */

import { setupCa } from "core/util/ca";
import { Telemetry } from "core/util/posthog";
import * as vscode from "vscode";
import { getExtensionVersion } from "./util/util";
import { ConfigHandler } from "core/config/ConfigHandler";
import { getUniqueId } from "./util/vscode";
import { MemFS } from './memFS';

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

export function activate(context: vscode.ExtensionContext) {
  setupCa();
  dynamicImportAndActivate(context);

  const memFs = new MemFS();
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider('memfs', memFs, {
      isCaseSensitive: true
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('pearai.openMemFS', () => {
      vscode.workspace.updateWorkspaceFolders(0, 0, {
        uri: vscode.Uri.parse('memfs:/'),
        name: "PearAI MemFS"
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('pearai.createMemFile', async () => {
      const fileName = await vscode.window.showInputBox({
        prompt: 'Enter new file name (e.g. example.txt)'
      });
      if (fileName) {
        const uri = vscode.Uri.parse(`memfs:/${fileName}`);
        memFs.writeFile(uri, new TextEncoder().encode(''), {
          create: true,
          overwrite: true
        });
        vscode.window.showTextDocument(uri);
      }
    })
  );

  // 커리큘럼 관련 명령어 처리기 등록
  context.subscriptions.push(
    vscode.commands.registerCommand('pearai.toggleCurriculum', () => {
      // 커리큘럼 뷰 토글 로직
      vscode.commands.executeCommand('workbench.view.extension.pearai-curriculum');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('pearai.focusCurriculum', () => {
      // 커리큘럼 뷰에 포커스
      vscode.commands.executeCommand('pearai.curriculum.focus');
    })
  );

  // 파일 탐색기 토글 명령어 추가
  context.subscriptions.push(
    vscode.commands.registerCommand('pearai.toggleFileExplorer', () => {
      vscode.commands.executeCommand('workbench.view.explorer');
    })
  );
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
