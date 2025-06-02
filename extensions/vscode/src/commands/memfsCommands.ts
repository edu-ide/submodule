import * as vscode from 'vscode';
import { MemFS } from '../memFS'; // MemFS 클래스 import 경로 확인 필요
import { TextEncoder } from 'util';

export function registerMemFSCommands(context: vscode.ExtensionContext, memFs: MemFS) {
    // MemFS 초기화 명령어
    context.subscriptions.push(vscode.commands.registerCommand('pearai.workspaceInit', _ => {
        // 기존 memFs 내용 삭제 로직
        try {
            for (const [name] of memFs.readDirectory(vscode.Uri.parse('memfs:/'))) {
                memFs.delete(vscode.Uri.parse(`memfs:/${name}`));
            }
            console.log('MemFS workspace initialized.');
        } catch (error) {
            console.error('Error initializing MemFS:', error);
            // Optionally show error message to user
            // vscode.window.showErrorMessage('Failed to initialize MemFS workspace.');
        }
    }));

    // MemFS 워크스페이스 폴더 열기 명령어
    context.subscriptions.push(
        vscode.commands.registerCommand('pearai.openMemFS', () => {
            const memFsUri = vscode.Uri.parse('memfs:/');
            const folderName = "PearAI MemFS";

            // 이미 열려있는지 확인
            const existingFolder = vscode.workspace.workspaceFolders?.find(
                folder => folder.uri.scheme === 'memfs'
            );

            if (!existingFolder) {
                vscode.workspace.updateWorkspaceFolders(
                    vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0,
                    0,
                    { uri: memFsUri, name: folderName }
                );
                // 파일 탐색기 새로고침 (약간의 지연 후)
                setTimeout(() => {
                    vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
                }, 500); // 지연 시간 조정 가능
            } else {
                // 이미 열려있으면 해당 폴더에 포커스
                vscode.commands.executeCommand('revealInExplorer', existingFolder.uri);
            }
        })
    );

    // MemFS 파일 생성 명령어
    context.subscriptions.push(
        vscode.commands.registerCommand('pearai.createMemFile', async () => {
            const fileName = await vscode.window.showInputBox({
                prompt: 'Enter new file name (e.g. example.txt)'
            });
            if (fileName) {
                try {
                    const uri = vscode.Uri.parse(`memfs:/${fileName}`);
                    // 파일이 이미 존재하는지 확인하고 덮어쓸지 물어볼 수 있음 (선택 사항)
                    memFs.writeFile(uri, new TextEncoder().encode(''), {
                        create: true,
                        overwrite: true
                    });
                    vscode.window.showTextDocument(uri);
                } catch (error) {
                    console.error('Error creating MemFS file:', error);
                    vscode.window.showErrorMessage(`Failed to create file: ${fileName}`);
                }
            }
        })
    );
} 