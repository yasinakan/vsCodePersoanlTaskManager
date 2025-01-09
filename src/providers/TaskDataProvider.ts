import * as vscode from 'vscode';
import { TaskService, ITask } from '../services/TaskService';

export class TaskDataProvider implements vscode.TreeDataProvider<TaskItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TaskItem | undefined | null | void> = new vscode.EventEmitter<TaskItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TaskItem | undefined | null | void> = this._onDidChangeTreeData.event;
    
    constructor(private taskService: TaskService) {}

    getTreeItem(element: TaskItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: TaskItem): Promise<TaskItem[]> {
        const tasks = await this.taskService.getTasks();
        return tasks.map(task => 
            new TaskItem(task.name, vscode.TreeItemCollapsibleState.None)
        );
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

class TaskItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
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
