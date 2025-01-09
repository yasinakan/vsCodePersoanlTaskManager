import * as vscode from 'vscode';
import { TaskService, ITask } from '../services/TaskService';

class GroupItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly groupType: 'grand_parent' | 'parent',
        public readonly parentLabel?: string
    ) {
        super(label, collapsibleState);
        this.contextValue = groupType;
        this.iconPath = new vscode.ThemeIcon('folder');
    }
}

class TaskItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly task: ITask
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `Click to run ${this.label}`;
        this.command = {
            command: 'taskManager.runTask',
            title: 'Run Task',
            arguments: [this.label]
        };
        this.iconPath = new vscode.ThemeIcon('play');
        this.contextValue = 'task';
    }
}

export class TaskDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    
    constructor(private taskService: TaskService) {}

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        const tasks = await this.taskService.getTasks();

        if (!element) {
            // Root level - show grand_parent groups
            const groups = new Set(tasks.map(task => task.group?.grand_parent).filter(Boolean));
            return Array.from(groups).map(group => 
                new GroupItem(group!, vscode.TreeItemCollapsibleState.Expanded, 'grand_parent')
            );
        } 
        else if (element instanceof GroupItem) {
            if (element.contextValue === 'grand_parent') {
                // Show parent groups under grand_parent
                const parentGroups = new Set(
                    tasks
                        .filter(task => task.group?.grand_parent === element.label)
                        .map(task => task.group?.parent)
                        .filter(Boolean)
                );
                return Array.from(parentGroups).map(parent => 
                    new GroupItem(parent!, vscode.TreeItemCollapsibleState.Expanded, 'parent', element.label)
                );
            } else if (element.contextValue === 'parent') {
                // Show tasks under parent
                return tasks
                    .filter(task => 
                        task.group?.parent === element.label && 
                        task.group?.grand_parent === element.parentLabel
                    )
                    .map(task => new TaskItem(task.name, task));
            }
        }
        return [];
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}
