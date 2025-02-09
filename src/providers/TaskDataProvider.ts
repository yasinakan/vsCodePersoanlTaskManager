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
        // Use different icons for grand_parent and parent groups
        this.iconPath = new vscode.ThemeIcon(
            groupType === 'grand_parent' ? 'symbol-folder' : 'folder-library'
        );
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
        this.iconPath = new vscode.ThemeIcon('terminal-cmd');
        this.contextValue = 'task';
    }
}

export class TaskDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    private searchQuery: string = '';
    
    constructor(private taskService: TaskService) {}

    setSearchQuery(query: string) {
        this.searchQuery = query.toLowerCase();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        const tasks = await this.taskService.getTasks(true); // Force refresh on reload

        if (!element) {
            // Get filtered tasks first
            const filteredTasks = tasks.filter(task => 
                this.searchQuery === '' || 
                task.name.toLowerCase().includes(this.searchQuery) ||
                task.group?.parent?.toLowerCase().includes(this.searchQuery) ||
                task.group?.grand_parent?.toLowerCase().includes(this.searchQuery)
            );

            // Only show grand_parent groups that have tasks after filtering
            const groupsWithTasks = new Set(filteredTasks.map(task => task.group?.grand_parent).filter(Boolean));
            return Array.from(groupsWithTasks).map(group => 
                new GroupItem(group!, vscode.TreeItemCollapsibleState.Expanded, 'grand_parent')
            );
        } 
        else if (element instanceof GroupItem) {
            if (element.contextValue === 'grand_parent') {
                // Filter tasks first
                const filteredTasks = tasks.filter(task => 
                    task.group?.grand_parent === element.label &&
                    (this.searchQuery === '' || 
                    task.name.toLowerCase().includes(this.searchQuery) ||
                    task.group?.parent?.toLowerCase().includes(this.searchQuery) ||
                    task.group?.grand_parent?.toLowerCase().includes(this.searchQuery))
                );

                // Only show parent groups that have tasks after filtering
                const parentGroups = new Set(
                    filteredTasks
                        .map(task => task.group?.parent)
                        .filter(Boolean)
                );

                return Array.from(parentGroups).map(parent => 
                    new GroupItem(parent!, vscode.TreeItemCollapsibleState.Expanded, 'parent', element.label)
                );
            } else if (element.contextValue === 'parent') {
                return tasks
                    .filter(task => 
                        task.group?.parent === element.label && 
                        task.group?.grand_parent === element.parentLabel
                    )
                    .filter(task => 
                        this.searchQuery === '' || 
                        task.name.toLowerCase().includes(this.searchQuery) ||
                        task.group?.parent?.toLowerCase().includes(this.searchQuery) ||
                        task.group?.grand_parent?.toLowerCase().includes(this.searchQuery))
                    .map(task => new TaskItem(task.name, task));
            }
        }
       
        return [];
    }

    async refresh(): Promise<void> {
        this.taskService.clearCache(); // Clear the cache
        this._onDidChangeTreeData.fire(); // Trigger refresh
        this.searchQuery = ""; // Clear search query
        this._onDidChangeTreeData.fire();
    }
}
