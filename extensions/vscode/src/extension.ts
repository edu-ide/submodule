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
      const url = "http://localhost:9000/edu/content/test/test.zip"
      if (url) {
        try {
          // 워크스페이스 확인
          const workspaceFolders = vscode.workspace.workspaceFolders;
          if (!workspaceFolders) {
            throw new Error('워크스페이스가 열려있지 않습니다. 먼저 폴더를 열어주세요.');
          }

          const zipBuffer = await fetchZip(url);
          const zip = new AdmZip(zipBuffer);
          
          // 0_practice 폴더 경로 생성
          const workspaceRoot = workspaceFolders[0].uri;
          const practiceFolderUri = vscode.Uri.joinPath(workspaceRoot, '0_practice');
          
          // 0_practice 폴더 생성 (없는 경우)
          try {
            await vscode.workspace.fs.createDirectory(practiceFolderUri);
          } catch (err) {
            // 폴더가 이미 존재하는 경우 무시
          }

          // ZIP 파일 내용을 0_practice 폴더에 추출하면서 폴더 구조 유지
          const entries = zip.getEntries();
          for (const entry of entries) {
            if (!entry.isDirectory) {
              const entryPath = entry.entryName.replace(/\\/g, '/');
              const entryDirPath = path.dirname(entryPath);
              
              // 파일이 들어갈 디렉토리 경로 생성
              if (entryDirPath !== '.') {
                const fullDirPath = vscode.Uri.joinPath(practiceFolderUri, entryDirPath);
                try {
                  await vscode.workspace.fs.createDirectory(fullDirPath);
                } catch (err) {
                  // 디렉토리가 이미 존재하는 경우 무시
                }
              }
              
              // 파일 생성
              const fileUri = vscode.Uri.joinPath(practiceFolderUri, entryPath);
              await vscode.workspace.fs.writeFile(fileUri, entry.getData());
            }
          }
          
          vscode.window.showInformationMessage('Practice Content loaded successfully to 0_practice folder');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error occurred';
          vscode.window.showErrorMessage(`Failed to load ZIP: ${message}`);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('pearai.createPracticeFile', async (language: string, code: string) => {
      try {
        // 파일 확장자 결정
        const getFileExtension = (lang: string): string => {
          const extensionMap: { [key: string]: string } = {
            'python': '.py',
            'javascript': '.js',
            'typescript': '.ts',
            'java': '.java',
            'c': '.c',
            'cpp': '.cpp',
            'csharp': '.cs',
            'go': '.go',
            'rust': '.rs',
            'ruby': '.rb',
            'php': '.php',
            'swift': '.swift',
            'kotlin': '.kt',
            'scala': '.scala',
            'html': '.html',
            'css': '.css',
            'sql': '.sql',
            'shell': '.sh',
            'bash': '.sh',
            'powershell': '.ps1',
            'markdown': '.md',
            'json': '.json',
            'yaml': '.yaml',
            'xml': '.xml',
            'text': '.txt'
          };
          return extensionMap[lang.toLowerCase()] || '.txt';
        };

        // 현재 워크스페이스 폴더 가져오기
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
          throw new Error('워크스페이스가 열려있지 않습니다. 먼저 폴더를 열어주세요.');
        }

        const extension = getFileExtension(language);
        const fileName = `practice${extension}`;
        
        // 0_practice 폴더 경로 생성
        const workspaceRoot = workspaceFolders[0].uri;
        const practiceFolderUri = vscode.Uri.joinPath(workspaceRoot, '0_practice');
        
        // 0_practice 폴더 생성 (없는 경우)
        try {
          await vscode.workspace.fs.createDirectory(practiceFolderUri);
        } catch (err) {
          // 폴더가 이미 존재하는 경우 무시
        }

        const fileUri = vscode.Uri.joinPath(practiceFolderUri, fileName);

        // 파일이 이미 존재하는지 확인
        try {
          await vscode.workspace.fs.stat(fileUri);
          // 파일이 존재하면 타임스탬프를 추가하여 새 파일명 생성
          const timestamp = new Date().getTime();
          const newFileName = `practice_${timestamp}${extension}`;
          const newFileUri = vscode.Uri.joinPath(practiceFolderUri, newFileName);
          
          // 새 파일 생성
          await vscode.workspace.fs.writeFile(newFileUri, new TextEncoder().encode(code));
          await vscode.window.showTextDocument(newFileUri);
          vscode.window.showInformationMessage(`${newFileName} 파일이 0_practice 폴더에 생성되었습니다.`);
        } catch (err) {
          // 파일이 존재하지 않으면 원래 파일명으로 생성
          await vscode.workspace.fs.writeFile(fileUri, new TextEncoder().encode(code));
          await vscode.window.showTextDocument(fileUri);
          vscode.window.showInformationMessage(`${fileName} 파일이 0_practice 폴더에 생성되었습니다.`);
        }

      } catch (error) {
        const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
        vscode.window.showErrorMessage(`파일 생성 실패: ${message}`);
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
