import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { TextEncoder } from 'util';
import { promisify } from 'util';
import * as StreamZip from 'node-stream-zip';
import { fetchZip } from '../util/network'; // 분리된 fetchZip 함수 import
import { PracticeTreeItem } from '../viewProviders/practiceExplorerProvider';
import * as Diff from 'diff'; // 'diff' 패키지 설치 필요: npm install diff @types/diff
import type { VsCodeIde } from '../ideProtocol'; // VsCodeIde 타입 import 추가
// import type { EditorContent } from 'core/protocol/types'; // EditorContent 타입 import (필요시)
const pipeline = promisify(require('stream').pipeline);

let currentTerminal: vscode.Terminal | undefined;
// practiceId와 초기 상태 폴더 경로 매핑 (메모리 저장, 안정성을 위해 workspaceState 사용 권장)
const practiceInitialPaths = new Map<string, string>();

// --- Helper Function: Get all files recursively ---
async function getAllFilesRecursive(dirPath: string, basePath: string = dirPath): Promise<Map<string, string>> {
    const filesMap = new Map<string, string>();
    try {
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/'); // Use forward slashes for consistency
            if (entry.isDirectory()) {
                const subMap = await getAllFilesRecursive(fullPath, basePath);
                subMap.forEach((value, key) => filesMap.set(key, value));
            } else if (entry.isFile()) {
                filesMap.set(relativePath, fullPath);
            }
        }
    } catch (error) {
        console.error(`[getAllFilesRecursive] Error reading directory ${dirPath}:`, error);
        // Optionally re-throw or handle differently
    }
    return filesMap;
}
// ----------------------------------------------------

// --- Helper Function: Generate HTML diff ---
function generateHtmlDiff(diffString: string): string {
    if (!diffString || typeof diffString !== 'string') {
        return '<p>No diff data available.</p>';
    }
    try {
        const diffJson = Diff.parsePatch(diffString);
        let html = '';

        diffJson.forEach(fileDiff => {
            // 파일 이름 헤더 (옵션)
            // html += `<h4>${fileDiff.oldFileName === fileDiff.newFileName ? fileDiff.newFileName : `${fileDiff.oldFileName} -> ${fileDiff.newFileName}`}</h4>`;
            html += '<pre style="font-family: monospace; white-space: pre-wrap; word-wrap: break-word; background-color: var(--vscode-editor-background); padding: 10px; border-radius: 4px; border: 1px solid var(--vscode-editorWidget-border);">'; // Use VS Code theme variables

            fileDiff.hunks.forEach(hunk => {
                // Hunk 헤더 (옵션)
                // html += `<div style="color: grey;">${hunk.header}</div>`;
                hunk.lines.forEach(line => {
                    const firstChar = line.charAt(0);
                    const lineContent = line.substring(1).replace(/</g, '&lt;').replace(/>/g, '&gt;'); // Escape HTML

                    switch (firstChar) {
                        case '+':
                            // Use span for inline styling, consistent background
                            html += `<span style="color: var(--vscode-gitDecoration-addedResourceForeground); background-color: rgba(0, 128, 0, 0.1); display: block;">+${lineContent}</span>`;
                            break;
                        case '-':
                            // Use span for inline styling, consistent background
                            html += `<span style="color: var(--vscode-gitDecoration-deletedResourceForeground); background-color: rgba(128, 0, 0, 0.1); display: block;">-${lineContent}</span>`;
                            break;
                        case ' ': // Context line
                            // Use span for consistent block display if needed, or just text
                            html += `<span style="display: block;"> ${lineContent}</span>`;
                            break;
                        case '\\': // No newline at end of file indicator
                            // Optional: style this differently or omit
                            html += `<span style="color: grey; display: block;">${line}</span>`;
                            break;
                        default: // Should not happen in standard diffs, but handle just in case
                            // Use span for consistent block display if needed, or just text
                            html += `<span style="display: block;">${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
                            break;
                    }
                });
            });
            html += '</pre>';
        });

        return html || '<p>No changes detected.</p>'; // Return message if diff produced empty html
    } catch (e) {
        console.error("Error generating HTML diff:", e);
        // Fallback for safety, escape potential HTML in the original string
        const safeOriginalDiff = diffString.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<p>Error parsing diff.</p><pre style="white-space: pre-wrap; word-wrap: break-word;">${safeOriginalDiff}</pre>`;
    }
}
// -----------------------------------------

export function registerPracticeCommands(
    context: vscode.ExtensionContext,
    ide: VsCodeIde // ide 파라미터 추가
) {

    // 실습 파일 생성 명령어
    context.subscriptions.push(
        vscode.commands.registerCommand('pearai.createPracticeFile', async (language: string, code: string) => {
            try {
                const isTerminalCommand = ['shell', 'bash', 'powershell'].includes(language.toLowerCase());

                if (isTerminalCommand) {
                    const terminal = vscode.window.createTerminal('Practice Terminal');
                    terminal.show();
                    terminal.sendText(code);
                    vscode.window.showInformationMessage('터미널에 명령어가 입력되었습니다. 실행하려면 Enter를 누르세요.');
                    return;
                }

                type SupportedLanguages = 'python' | 'javascript' | 'typescript' | 'java' | 'c' | 'cpp' | 'csharp' | 'go' | 'rust' | 'ruby' | 'php' | 'swift' | 'kotlin' | 'scala' | 'html' | 'css' | 'sql' | 'markdown' | 'json' | 'yaml' | 'xml' | 'text';
                const extensionMap: Record<SupportedLanguages, string> = {
                    'python': '.py', 'javascript': '.js', 'typescript': '.ts', 'java': '.java', 'c': '.c', 'cpp': '.cpp', 'csharp': '.cs',
                    'go': '.go', 'rust': '.rs', 'ruby': '.rb', 'php': '.php', 'swift': '.swift', 'kotlin': '.kt', 'scala': '.scala',
                    'html': '.html', 'css': '.css', 'sql': '.sql', 'markdown': '.md', 'json': '.json', 'yaml': '.yaml', 'xml': '.xml', 'text': '.txt'
                };

                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders) {
                    throw new Error('워크스페이스가 열려있지 않습니다. 먼저 폴더를 열어주세요.');
                }

                const extension = extensionMap[language.toLowerCase() as keyof typeof extensionMap] || '.txt';
                const fileNameBase = `practice`;
                const practiceDirName = 'edusense.practice'; // 실습 폴더 이름 일관성 유지

                const workspaceRoot = workspaceFolders[0].uri;
                const practiceFolderUri = vscode.Uri.joinPath(workspaceRoot, practiceDirName);

                try {
                    await vscode.workspace.fs.createDirectory(practiceFolderUri);
                } catch (err) { /* 폴더 이미 존재 */ }

                const fileUriBase = vscode.Uri.joinPath(practiceFolderUri, `${fileNameBase}${extension}`);
                let fileUriToUse = fileUriBase;
                let counter = 1;

                // 파일명 충돌 시 숫자 증가 (practice_1.py, practice_2.py 등)
                while (true) {
                    try {
                        await vscode.workspace.fs.stat(fileUriToUse);
                        // 파일이 존재하면 카운터 증가 후 새 URI 생성
                        fileUriToUse = vscode.Uri.joinPath(practiceFolderUri, `${fileNameBase}_${counter++}${extension}`);
                    } catch (err) {
                        // stat 실패 (파일 없음) -> 이 URI 사용
                        break;
                    }
                }

                const finalFileName = path.basename(fileUriToUse.fsPath);

                await vscode.workspace.fs.writeFile(fileUriToUse, new TextEncoder().encode(code));
                await vscode.window.showTextDocument(fileUriToUse);
                vscode.window.showInformationMessage(`${finalFileName} 파일이 ${practiceDirName} 폴더에 생성되었습니다.`);

            } catch (error) {
                const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
                vscode.window.showErrorMessage(`파일 생성 실패: ${message}`);
            }
        })
    );

    // 터미널에 명령어 전송 명령어
    context.subscriptions.push(
        vscode.commands.registerCommand('pearai.sendCommandsToTerminal', (commands: string[], language: string) => {
            console.log(`Executing commands in terminal (${language}):`, commands);

            if (!currentTerminal || currentTerminal.exitStatus !== undefined) {
                currentTerminal = vscode.window.createTerminal(`PearAI Terminal`);
                vscode.window.onDidCloseTerminal(terminal => {
                    if (terminal === currentTerminal) {
                        currentTerminal = undefined;
                    }
                });
            }

            currentTerminal.show();

            commands.forEach(command => {
                if (currentTerminal) {
                    currentTerminal.sendText(command, true);
                } else {
                    console.error("Current terminal is unexpectedly undefined.");
                    vscode.window.showErrorMessage("Failed to send command: Terminal not available.");
                }
            });
        })
    );

    // 실습 워크스페이스 생성 명령어
    context.subscriptions.push(
        vscode.commands.registerCommand('pearai.createPracticeWorkspace', async (payload: { zipUrl: string, practiceId: string }) => {
            const { zipUrl, practiceId } = payload;
            if (!zipUrl || !practiceId) {
                vscode.window.showErrorMessage('Practice zip URL or Practice ID is missing.');
                return;
            }

            const progressOptions = {
                location: vscode.ProgressLocation.Notification,
                title: `Loading Practice: ${path.basename(zipUrl)} (${practiceId})`,
                cancellable: false
            };

            await vscode.window.withProgress(progressOptions, async (progress) => {
                let zip: StreamZip.StreamZipAsync | null = null;
                let tempZipPath: string | null = null;
                const practiceDirName = 'edusense.practice';
                let createdInitialStateFolderUri: vscode.Uri | null = null;

                try {
                    progress.report({ message: "Downloading..." });
                    const zipBuffer = await fetchZip(zipUrl);
                    progress.report({ message: "Download complete. Verifying..." });

                    const tempDir = os.tmpdir();
                    tempZipPath = path.join(tempDir, `downloaded_${Date.now()}.zip`);
                    await fs.promises.writeFile(tempZipPath, zipBuffer);
                    console.log(`Downloaded raw buffer saved to: ${tempZipPath}`);

                    progress.report({ message: "Preparing extraction..." });
                    zip = new StreamZip.async({ file: tempZipPath });

                    const workspaceFolders = vscode.workspace.workspaceFolders;
                    if (!workspaceFolders) {
                        throw new Error('No workspace folder is open. Please open a folder first.');
                    }
                    const workspaceRoot = workspaceFolders[0].uri;
                    const practiceFolderUri = vscode.Uri.joinPath(workspaceRoot, practiceDirName);

                    // --- 기존 실습 폴더 정리 (수정: 특정 practiceId의 초기 상태 폴더만 삭제 시도) ---
                    try {
                        const previousInitialPath = practiceInitialPaths.get(practiceId);
                        if (previousInitialPath) {
                            await vscode.workspace.fs.delete(vscode.Uri.file(previousInitialPath), { recursive: true });
                            console.log(`Deleted previous initial state folder for ${practiceId}: ${previousInitialPath}`);
                            practiceInitialPaths.delete(practiceId); // Map에서 제거
                        }
                        // 기존 edusense.practice 폴더 삭제는 그대로 유지 (항상 새로 시작)
                        await vscode.workspace.fs.delete(practiceFolderUri, { recursive: true });
                        console.log(`Deleted existing practice folder: ${practiceFolderUri.fsPath}`);
                    } catch (deleteError: any) {
                        // 폴더가 원래 없었던 경우는 무시 (ENOENT)
                        if (deleteError.code !== 'ENOENT' && deleteError.code !== 'FileNotFound') {
                            console.warn(`Could not delete previous folder(s): ${deleteError.message}`);
                        }
                    }
                    // -----------------------------------------------------------------

                    // 새 실습 폴더 생성
                    await vscode.workspace.fs.createDirectory(practiceFolderUri);
                    progress.report({ message: "Created practice directory." });
                    console.log(`Created practice directory: ${practiceFolderUri.fsPath}`);

                    const entries = await zip.entries();
                    const totalEntries = Object.keys(entries).length;
                    let extractedCount = 0;
                    progress.report({ message: `Extracting ${totalEntries} entries...` });

                    // 디렉토리 먼저 생성
                    const directories = Object.values(entries).filter(entry => (entry as StreamZip.ZipEntry).isDirectory);
                    for (const entry of directories) {
                        const knownEntry = entry as StreamZip.ZipEntry;
                        const entryPath = knownEntry.name.replace(/\\/g, '/');
                        const targetPath = vscode.Uri.joinPath(practiceFolderUri, entryPath);
                        try {
                            await vscode.workspace.fs.createDirectory(targetPath);
                        } catch (dirErr: any) {
                            if (dirErr.code !== 'EEXIST' && dirErr.code !== 'FileExists') {
                                console.error(`Failed to create directory ${targetPath.fsPath}:`, dirErr);
                            }
                        }
                    }

                    // 파일 추출
                    const files = Object.values(entries).filter(entry => !(entry as StreamZip.ZipEntry).isDirectory);
                    for (const entry of files) {
                        const knownEntry = entry as StreamZip.ZipEntry;
                        extractedCount++;
                        const entryPath = knownEntry.name.replace(/\\/g, '/');
                        const targetPath = vscode.Uri.joinPath(practiceFolderUri, entryPath);
                        progress.report({ message: `Extracting (${extractedCount}/${totalEntries}): ${entryPath}`, increment: (1 / totalEntries) * 100 });
                        try {
                            const stream = await zip.stream(knownEntry);
                            const writeStream = fs.createWriteStream(targetPath.fsPath);
                            await pipeline(stream, writeStream);
                        } catch (extractErr: any) {
                            console.error(`Failed to extract file ${entryPath} to ${targetPath.fsPath}:`, extractErr);
                            vscode.window.showWarningMessage(`Failed to extract file: ${entryPath}`);
                        }
                    }

                    // --- 초기 상태 복사 (수정: practiceId와 경로 매핑 저장) ---
                    progress.report({ message: "Saving initial state..." });
                    const initialFolderName = `.edusense_initial_${practiceId}_${Date.now()}`;
                    const initialFolderParentUri = vscode.Uri.file(os.tmpdir());
                    createdInitialStateFolderUri = vscode.Uri.joinPath(initialFolderParentUri, initialFolderName);

                    try {
                        await vscode.workspace.fs.copy(practiceFolderUri, createdInitialStateFolderUri, { overwrite: true });
                        const initialPath = createdInitialStateFolderUri.fsPath;
                        practiceInitialPaths.set(practiceId, initialPath); // Map에 저장
                        // context.workspaceState.update('practiceInitialPaths', Object.fromEntries(practiceInitialPaths)); // 안정적인 저장
                        console.log(`Copied initial state for ${practiceId} to: ${initialPath}`);
                    } catch (copyError) {
                        console.error(`Failed to copy initial state for ${practiceId}:`, copyError);
                        vscode.window.showWarningMessage(`Could not save initial state for practice: ${practiceId}`);
                        // 실패 시 Map에 추가하지 않음
                    }
                    // ----------------------------------------------------

                    // 워크스페이스 폴더 추가 로직 주석 처리됨
                    /*
                    const currentFolders = vscode.workspace.workspaceFolders ? [...vscode.workspace.workspaceFolders] : [];
                    const folderExistsInWorkspace = currentFolders.some(folder => folder.uri.fsPath === practiceFolderUri.fsPath);
                    if (!folderExistsInWorkspace) {
                        vscode.workspace.updateWorkspaceFolders(
                            currentFolders.length, 0,
                            { uri: practiceFolderUri, name: 'EduSense Practice' }
                        );
                    }
                    */

                    // === Context Key 설정 ===
                    vscode.commands.executeCommand('setContext', 'edusense:practiceFolderVisible', true);
                    // ========================

                    vscode.window.showInformationMessage(`Practice content loaded successfully into '${practiceDirName}' folder for practice '${practiceId}'.`);

                    // --- 새 터미널 열기 ---
                    try {
                        const terminalOptions: vscode.TerminalOptions = {
                            name: `EduSense Practice (${practiceId})`,
                            cwd: practiceFolderUri.fsPath
                        };
                        const terminal = vscode.window.createTerminal(terminalOptions);
                        terminal.show();
                        console.log(`Opened terminal for ${practiceId} in ${practiceFolderUri.fsPath}`);
                    } catch (terminalError) {
                        console.error("Failed to open terminal in practice folder:", terminalError);
                        vscode.window.showWarningMessage('Could not open terminal in the practice folder.');
                    }
                    // ------------------

                    // --- EduSense 패널 포커스 --- 
                    try {
                        await vscode.commands.executeCommand('workbench.view.pearai-curriculum');
                        console.log('Focused on EduSense panel.');
                    } catch (focusError) {
                        console.error("Failed to focus EduSense panel:", focusError);
                    }
                    // --------------------------

                } catch (error: any) {
                    console.error("Failed to create practice workspace:", error);
                    const message = error instanceof Error ? error.message : 'An unknown error occurred';
                    if (error.code === 'ECONNRESET' || error.message.includes('download')) {
                        vscode.window.showErrorMessage(`Failed to download practice: ${message}`);
                    } else if (message.toLowerCase().includes('zip')) {
                        vscode.window.showErrorMessage(`Failed to process ZIP file. It might be corrupted or in an unsupported format. Error: ${message}`);
                    } else {
                        vscode.window.showErrorMessage(`Failed to load practice: ${message}`);
                    }
                } finally {
                    if (zip) { await zip.close(); }
                    if (tempZipPath) { try { await fs.promises.unlink(tempZipPath); } catch (e) { console.error(`Failed to delete temp zip: ${e}`); } }
                }
            });
        })
    );

    // --- 'Reveal in OS Explorer' 명령어 정의 ---
    context.subscriptions.push(
        vscode.commands.registerCommand('edusense.revealPracticeItemInExplorer', (item: PracticeTreeItem | vscode.Uri) => {
            let uriToReveal: vscode.Uri | undefined;

            // TreeItem에서 직접 호출되거나 URI가 직접 전달될 수 있음
            if (item instanceof PracticeTreeItem) {
                uriToReveal = item.resourceUri;
            } else if (item instanceof vscode.Uri) {
                uriToReveal = item;
            }

            if (uriToReveal) {
                // OS 파일 탐색기에서 보여주는 명령어로 변경
                vscode.commands.executeCommand('revealFileInOS', uriToReveal);
            } else {
                console.warn('Could not determine URI to reveal for item:', item);
            }
        })
    );
    // ----------------------------------------

    // --- 'Reveal in Explorer View' 명령어 정의 추가 ---
    context.subscriptions.push(
        vscode.commands.registerCommand('edusense.revealInExplorerView', (item: PracticeTreeItem | vscode.Uri) => {
            let uriToReveal: vscode.Uri | undefined;

            if (item instanceof PracticeTreeItem) {
                uriToReveal = item.resourceUri;
            } else if (item instanceof vscode.Uri) {
                uriToReveal = item;
            }

            if (uriToReveal) {
                // VSCode 내장 파일 탐색기에서 보여주는 명령어 실행
                vscode.commands.executeCommand('revealInExplorer', uriToReveal);
            } else {
                console.warn('Could not determine URI to reveal for item:', item);
            }
        })
    );
    // -------------------------------------------

    // === 실습 제출 명령어 (수정: testResultBlock + Prompt 추가) ===
    context.subscriptions.push(
        vscode.commands.registerCommand('pearai.submitPractice', async (payload: { practiceId: string; requirements: string }) => {
            const { practiceId, requirements } = payload;
            let diffResult: string | null = null;
            let htmlDiffResult: string | null = null;
            let submissionError: string | undefined;
            const allDiffs: string[] = [];

            try {
                // --- Basic Checks and Diff Calculation ---
                if (!practiceId) {
                    submissionError = "제출할 실습 ID가 없습니다.";
                    throw new Error(submissionError);
                }
                vscode.window.showInformationMessage(`'${practiceId}' 실습 제출을 시작합니다...`);
                console.log(`[SubmitPractice] Executing command for ${practiceId}. Requirements length: ${requirements?.length ?? 0}`);

                const initialPath = practiceInitialPaths.get(practiceId);
                if (!initialPath) {
                    submissionError = `'${practiceId}'에 대한 초기 실습 상태를 찾을 수 없습니다. 실습을 다시 시작해주세요.`;
                    throw new Error(submissionError);
                }

                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders || workspaceFolders.length === 0) {
                    submissionError = '워크스페이스가 열려있지 않습니다.';
                    throw new Error(submissionError);
                }
                const workspaceRoot = workspaceFolders[0].uri;
                const currentPracticeDir = 'edusense.practice';
                const currentPracticePath = vscode.Uri.joinPath(workspaceRoot, currentPracticeDir).fsPath;

                try {
                    const initialFilesMap = await getAllFilesRecursive(initialPath);
                    const currentFilesMap = await getAllFilesRecursive(currentPracticePath);
                    const allRelativePaths = new Set([...initialFilesMap.keys(), ...currentFilesMap.keys()]);

                    if (allRelativePaths.size > 0) {
                        for (const relativePath of allRelativePaths) {
                            const initialFilePath = initialFilesMap.get(relativePath);
                            const currentFilePath = currentFilesMap.get(relativePath);
                            let initialContent = '', currentContent = '', fileDiff: string | undefined;
                            try {
                                if (initialFilePath) initialContent = await fs.promises.readFile(initialFilePath, 'utf8');
                                if (currentFilePath) currentContent = await fs.promises.readFile(currentFilePath, 'utf8');
                                if (initialFilePath && currentFilePath) {
                                    if (initialContent !== currentContent) {
                                        fileDiff = Diff.createPatch(relativePath, initialContent, currentContent, '', '', { context: 3 });
                                    }
                                } else if (!initialFilePath && currentFilePath) {
                                    fileDiff = Diff.createPatch(relativePath, '', currentContent, '', '', { context: 3 });
                                } else if (initialFilePath && !currentFilePath) {
                                    fileDiff = Diff.createPatch(relativePath, initialContent, '', '', '', { context: 3 });
                                }
                                if (fileDiff) allDiffs.push(fileDiff);
                            } catch (fileReadError: any) {
                                allDiffs.push(`--- Error processing ${relativePath} ---\n${fileReadError.message}\n`);
                            }
                        }
                        if (allDiffs.length > 0) {
                            diffResult = allDiffs.join('\n');
                            htmlDiffResult = generateHtmlDiff(diffResult); // HTML diff 생성
                        } else {
                            diffResult = "No changes detected in any files.";
                            htmlDiffResult = `<p>${diffResult}</p>`;
                        }
                    } else {
                        diffResult = "No files found in practice directories.";
                        htmlDiffResult = `<p>${diffResult}</p>`;
                    }
                } catch (error: any) {
                    submissionError = `Diff calculation failed: ${error.message}`;
                    diffResult = null;
                    htmlDiffResult = null;
                }
                // -----------------------------------------------------

            } catch (error: any) { // Outer catch
                if (!submissionError) submissionError = error.message;
                diffResult = null;
                htmlDiffResult = null;
            }

            // --- 웹뷰로 결과 전송 (수정: forwardEducationContextToChat + testResultBlock + Prompt) ---
            try {
                console.log(`[SubmitPractice] Waiting for webviewProtocolPromise for practice ${practiceId}...`);
                const webviewProtocol = await ide.webviewProtocolPromise;
                if (webviewProtocol) {
                    const title = submissionError ? `제출 오류 (${practiceId})` : `제출 결과 (${practiceId})`;
                    const category = "제출 결과";
                    const contentToSend = submissionError ? submissionError : (htmlDiffResult || "결과를 표시할 수 없습니다.");
                    const resultPrompt = submissionError ? "오류가 발생했습니다:" : "위의 내용 요구사항을 잘 반영했는지 체점해줘 "; // 추가할 프롬프트

                    const editorContent = {
                        type: "doc" as const,
                        content: [
                            {
                                type: "testResultBlock",
                                attrs: {
                                    title: title,
                                    category: category,
                                    htmlContent: contentToSend,
                                    requirements: requirements
                                }
                            }
                        ]
                    };

                    const payloadForWebview = {
                        shouldRun: true, // 자동 실행 안 함
                        prompt: resultPrompt, // 결과 앞에 텍스트 추가
                        content: editorContent
                    };

                    console.log(`[SubmitPractice] Sending forwardEducationContextToChat to webview for ${practiceId} with type testResultBlock and prompt.`);
                    await webviewProtocol.request("forwardEducationContextToChat", payloadForWebview);

                    console.log("[SubmitPractice] Submission result sent to webview.");
                    if (submissionError) {
                        vscode.window.showErrorMessage(`실습 제출 실패: ${submissionError}`);
                    } else if (diffResult && diffResult !== "No changes detected in any files." && diffResult !== "No files found in practice directories.") {
                        vscode.window.showInformationMessage(`'${practiceId}' 실습 제출 완료. 결과가 표시됩니다.`);
                    }
                } else {
                    console.error("[SubmitPractice] Error: Cannot send result to webview: VsCodeWebviewProtocol promise did not resolve.");
                    vscode.window.showErrorMessage("웹뷰 통신 채널을 초기화할 수 없습니다. VSCode를 재시작해주세요.");
                }
            } catch (sendError) {
                console.error("[SubmitPractice] Error sending submission result to webview:", sendError);
                vscode.window.showErrorMessage("제출 결과를 웹뷰로 전송하는 중 오류가 발생했습니다.");
            }
            // ------------------------------------------------------------------------------------
        })
    );

    // === (선택 사항) 실습 종료 및 폴더 삭제 명령어 ===
    context.subscriptions.push(
        vscode.commands.registerCommand('edusense.closePractice', async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders && workspaceFolders.length > 0) {
                const workspaceRoot = workspaceFolders[0].uri;
                const practiceFolderUri = vscode.Uri.joinPath(workspaceRoot, 'edusense.practice');
                const practiceFolderName = 'EduSense Practice'; // 워크스페이스 폴더 추가 시 사용한 이름

                try {
                    // 1. 워크스페이스 폴더에서 제거 (선택적)
                    /*
                    const currentFolders = vscode.workspace.workspaceFolders ? [...vscode.workspace.workspaceFolders] : [];
                    const folderIndex = currentFolders.findIndex(folder => folder.uri.fsPath === practiceFolderUri.fsPath && folder.name === practiceFolderName);
                    if (folderIndex > -1) {
                        vscode.workspace.updateWorkspaceFolders(folderIndex, 1); // 해당 인덱스에서 1개 제거
                    }
                    */

                    // 2. 파일 시스템에서 폴더 삭제
                    await vscode.workspace.fs.delete(practiceFolderUri, { recursive: true, useTrash: false }); // 휴지통 사용 안 함

                    // 3. 초기 상태 폴더 삭제 (메모리 및 잠재적 디스크)
                    practiceInitialPaths.forEach(async (initialPath, practiceId) => {
                        try {
                            await fs.promises.rm(initialPath, { recursive: true, force: true });
                            console.log(`[ClosePractice] Deleted initial state folder for ${practiceId}: ${initialPath}`);
                        } catch (deleteError) {
                            console.warn(`[ClosePractice] Could not delete initial state folder ${initialPath}:`, deleteError);
                        }
                    });
                    practiceInitialPaths.clear(); // 맵 비우기

                    // 4. Context Key 설정하여 뷰 숨기기
                    vscode.commands.executeCommand('setContext', 'edusense:practiceFolderVisible', false);

                    vscode.window.showInformationMessage('Practice closed and folders deleted.');
                    await vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer'); // 탐색기 새로고침

                } catch (error) {
                    console.error("[ClosePractice] Error closing practice:", error);
                    vscode.window.showErrorMessage('Failed to close practice session.');
                }
            } else {
                vscode.window.showWarningMessage('No workspace open.');
            }
        })
    );

    // 실습 탐색기 새로고침 명령어
    context.subscriptions.push(
        vscode.commands.registerCommand('pearai.refreshCurriculumView', () => {
            // TreeDataProvider의 새로고침을 위해 전체 파일 탐색기를 새로고침
            vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
            vscode.window.showInformationMessage('실습 파일 목록이 새로고침되었습니다.');
        })
    );
} 