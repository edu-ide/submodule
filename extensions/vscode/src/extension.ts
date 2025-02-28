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
import AdmZip from 'adm-zip';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';

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

async function fetchZip(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      const chunks: Uint8Array[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
  });
}

function addZipContentToMemFS(memFs: MemFS, zip: AdmZip) {
  const progressOptions = { location: vscode.ProgressLocation.Notification, title: "Loading ZIP Content" };
  
  return vscode.window.withProgress(progressOptions, async (progress) => {
    // 모든 디렉토리 경로 수집
    const allPaths = new Set<string>();
    // 파일 엔트리 처리
    progress.report({ message: "Processing files..." });
    const entries = zip.getEntries();
    for (const entry of entries) {
      const entryPath = entry.entryName.replace(/\\/g, '/');
      const isDirectory = entry.isDirectory;

      // 디렉토리 경로 추출
      const pathSegments = entryPath.split('/').filter(p => p);
      let currentPath = '';
      for (const segment of pathSegments.slice(0, -1)) {
        currentPath += `/${segment}`;
        allPaths.add(currentPath);
      }
      
      if (isDirectory) {
        allPaths.add(`/${entryPath}`);
      }
    }

    // 디렉토리 생성
    progress.report({ message: "Creating directories..." });
    const sortedPaths = Array.from(allPaths).sort((a, b) => a.split('/').length - b.split('/').length);
    for (const dirPath of sortedPaths) {
      const uri = vscode.Uri.parse(`memfs:${dirPath}`);
      try {
        memFs.createDirectory(uri);
      } catch (e) {
        // 무시
      }
    }

    // 파일 생성
    progress.report({ message: "Creating files..." });
    for (const entry of entries.filter(e => !e.isDirectory)) {
      const entryPath = entry.entryName.replace(/\\/g, '/');
      const uri = vscode.Uri.parse(`memfs:/${entryPath}`);
      
      // 파일 쓰기
      memFs.writeFile(uri, entry.getData(), { create: true, overwrite: true });
      vscode.window.showInformationMessage(`Created file: ${uri.path}`);
    }
  });
}

export function activate(context: vscode.ExtensionContext) {
  setupCa();
  dynamicImportAndActivate(context);

  // MemFS 인스턴스 생성 방식 수정
  const memFs = new MemFS();

  // 파일 시스템 제공자 등록
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider('memfs', memFs, {
      isCaseSensitive: true
    })
  );
	context.subscriptions.push(vscode.commands.registerCommand('pearai.workspaceInit', _ => {
		for (const [name] of memFs.readDirectory(vscode.Uri.parse('memfs:/'))) {
			memFs.delete(vscode.Uri.parse(`memfs:/${name}`));
		}
	}));
  context.subscriptions.push(
    vscode.commands.registerCommand('pearai.openMemFS', () => {
      vscode.workspace.updateWorkspaceFolders(0, 0, {
        uri: vscode.Uri.parse('memfs:/'),
        name: "PearAI MemFS"
      });
      // 파일 탐색기 새로고침
      setTimeout(() => {
        vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
      }, 300);
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

  context.subscriptions.push(
    vscode.commands.registerCommand('pearai.loadZipContent', async () => {
      const url = await vscode.window.showInputBox({
        prompt: 'Enter the URL of the ZIP file'
      });
      //const url = 'http://localhost:9000/edu/content/test/test2.zip';
      
      if (url) {
        try {
          const zipBuffer = await fetchZip(url);
          const zip = new AdmZip(zipBuffer);
          
          // 기존 워크스페이스 정리
          
          // ZIP 내용 MemFS에 로드
          await addZipContentToMemFS(memFs, zip);
          
          // 워크스페이스 초기화 명령어 실행
          await vscode.commands.executeCommand('pearai.openMemFS');
          
          vscode.window.showInformationMessage('ZIP content loaded successfully');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error occurred';
          vscode.window.showErrorMessage(`Failed to load ZIP: ${message}`);
        }
      }
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
