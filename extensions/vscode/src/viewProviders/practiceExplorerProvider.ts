import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs'; // fs 모듈 추가

// TreeView의 각 항목을 나타내는 클래스
export class PracticeTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string, // 파일/폴더 이름
        public readonly resourceUri: vscode.Uri, // 실제 파일/폴더 URI
        public readonly fileType: vscode.FileType, // 항목 타입 (File, Directory 등)
        public readonly collapsibleState: vscode.TreeItemCollapsibleState // 확장 가능 여부
    ) {
        super(label, collapsibleState);
        this.resourceUri = resourceUri;
        this.tooltip = `${this.label}`;
        // 파일 타입에 따라 아이콘 설정 (VSCode 기본 아이콘 사용)
        this.iconPath = fileType === vscode.FileType.Directory ? vscode.ThemeIcon.Folder : vscode.ThemeIcon.File;
        // 파일을 클릭했을 때 실행될 명령 설정 (파일 열기)
        this.contextValue = fileType === vscode.FileType.Directory ? 'practiceRoot' : 'practiceFile'; // TreeItem의 종류를 식별하는 값
        if (fileType === vscode.FileType.File) {
            // 마크다운 파일(.md)인 경우 미리보기 명령 사용
            if (resourceUri.fsPath.toLowerCase().endsWith('.md')) {
                this.command = {
                    command: 'markdown.showPreview',
                    title: "Open Markdown Preview",
                    arguments: [resourceUri],
                };
            } else {
                // 그 외 파일은 기본 열기 명령어 사용
                this.command = {
                    command: 'vscode.open',
                    title: "Open File",
                    arguments: [resourceUri],
                };
            }
        }
    }
}

// TreeView에 데이터를 제공하는 Provider 클래스
export class PracticeExplorerProvider implements vscode.TreeDataProvider<PracticeTreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<PracticeTreeItem | undefined | null | void> = new vscode.EventEmitter<PracticeTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<PracticeTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private watcher?: vscode.FileSystemWatcher;
    private practiceFolderUri?: vscode.Uri;

    constructor(private workspaceRoot?: vscode.Uri) {
        if (workspaceRoot) {
            this.practiceFolderUri = vscode.Uri.joinPath(workspaceRoot, 'edusense.practice');
            this.setupWatcher();
        }

        // 워크스페이스 변경 시 watcher 재설정
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            this.workspaceRoot = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri : undefined;
            if (this.workspaceRoot) {
                this.practiceFolderUri = vscode.Uri.joinPath(this.workspaceRoot, 'edusense.practice');
                this.setupWatcher();
                this.refresh();
            } else {
                this.practiceFolderUri = undefined;
                this.watcher?.dispose();
                this.watcher = undefined;
                this.refresh();
            }
        });
    }

    // TreeView 새로고침
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    // 파일 시스템 감시자 설정
    private setupWatcher(): void {
        this.watcher?.dispose();
        if (this.practiceFolderUri) {
            // fsPath 사용 시 주의: URI 스키마에 따라 동작이 다를 수 있음
            const pattern = new vscode.RelativePattern(this.practiceFolderUri.fsPath, '**/*');
            this.watcher = vscode.workspace.createFileSystemWatcher(pattern);

            this.watcher.onDidChange(_uri => this.refresh());
            this.watcher.onDidCreate(_uri => this.refresh());
            this.watcher.onDidDelete(_uri => this.refresh());
        } else {
            this.watcher = undefined;
        }
    }

    // TreeItem 가져오기 (여기서는 element 자체를 반환)
    getTreeItem(element: PracticeTreeItem): vscode.TreeItem {
        return element;
    }

    // 자식 요소들 가져오기 (element가 없으면 루트, 있으면 해당 폴더의 자식)
    async getChildren(element?: PracticeTreeItem): Promise<PracticeTreeItem[]> {
        if (!this.practiceFolderUri) {
            // vscode.window.showInformationMessage('No edusense.practice folder in workspace');
            return Promise.resolve([]);
        }

        const targetUri = element ? element.resourceUri : this.practiceFolderUri;

        try {
            const entries = await vscode.workspace.fs.readDirectory(targetUri);
            const items: PracticeTreeItem[] = [];

            for (const [name, type] of entries) {
                const uri = vscode.Uri.joinPath(targetUri, name);
                const collapsibleState = type === vscode.FileType.Directory
                    ? vscode.TreeItemCollapsibleState.Collapsed
                    : vscode.TreeItemCollapsibleState.None;
                items.push(new PracticeTreeItem(name, uri, type, collapsibleState));
            }

            // 이름 순서대로 정렬 (폴더 우선)
            items.sort((a, b) => {
                if (a.fileType !== b.fileType) {
                    return a.fileType === vscode.FileType.Directory ? -1 : 1;
                }
                return a.label.localeCompare(b.label);
            });

            return items;
        } catch (error) {
            // 폴더가 없거나 접근 오류 시 빈 배열 반환
            // console.error(`Error reading directory ${targetUri.fsPath}:`, error);
            // vscode.window.showErrorMessage(`Could not read practice folder: ${targetUri.fsPath}`);
            return Promise.resolve([]);
        }
    }
} 