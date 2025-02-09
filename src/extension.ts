import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TaskDataProvider } from './providers/TaskDataProvider';
import { TaskService } from './services/TaskService';
import { ConfigurationService } from './services/ConfigurationService';

async function initializeDefaultTaskFiles(context: vscode.ExtensionContext) {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    if (!homeDir) return;

    const userTasksDir = path.join(homeDir, '.vscode-tasks');
    const taskFiles = ['DefaultTasks1.json', 'DefaultTasks2.json'];
    const taskPaths: string[] = [];

    // Create user tasks directory if it doesn't exist
    if (!fs.existsSync(userTasksDir)) {
        fs.mkdirSync(userTasksDir, { recursive: true });
    }

    // Copy task files if they don't exist
    for (const taskFile of taskFiles) {
        const userTaskPath = path.join(userTasksDir, taskFile);
        taskPaths.push(userTaskPath);

        if (!fs.existsSync(userTaskPath)) {
            const sourceTaskPath = path.join(context.extensionPath, 'resources', 'defaultTasks', taskFile);
            fs.copyFileSync(sourceTaskPath, userTaskPath);
        }
    }

    // Update configuration to include both task files
    const config = vscode.workspace.getConfiguration('Tasks');
    const currentPaths = config.get<string[]>('json') || [];

 // Only update configuration if there is no existing Tasks configuration
if (!currentPaths || currentPaths.length === 0) {   
    const newPaths = [...new Set([...currentPaths, ...taskPaths])];
    if (newPaths.length !== currentPaths.length) {
        await config.update('json', newPaths, vscode.ConfigurationTarget.Global);
    }


}
}

class TasksProvider implements vscode.TaskProvider {
    constructor(private taskService: TaskService) {}

    async provideTasks(): Promise<vscode.Task[]> {
        try {
            const tasks = await this.taskService.getTasks();
            return tasks.map(task => this.taskService.createVSCodeTask(task));
        } catch (error) {
            vscode.window.showErrorMessage(`Error providing tasks: ${error}`);
            return [];
        }
    }

    resolveTask(_task: vscode.Task): vscode.ProviderResult<vscode.Task> {
        return undefined;
    }
}

export function activate(context: vscode.ExtensionContext) {
    // Initialize default task files
    initializeDefaultTaskFiles(context).catch(err => 
        vscode.window.showErrorMessage(`Failed to initialize default task files: ${err}`)
    );

    const configService = new ConfigurationService();
    const taskService = new TaskService(configService);

    // Register the hello world command
//    context.subscriptions.push(vscode.commands.registerCommand('helloWorld.show', () => {
//        vscode.window.showInformationMessage('Hello World');
//    }));

    // Register the task provider with type 'Tasks' to match package.json
    const taskProvider = vscode.tasks.registerTaskProvider('Tasks', new TasksProvider(taskService));
    context.subscriptions.push(taskProvider);

    const taskDataProvider = new TaskDataProvider(taskService);
    const treeView = vscode.window.createTreeView('taskManagerView', {
        treeDataProvider: taskDataProvider,
        showCollapseAll: true
    });

    // Add search box
    let searchBox: vscode.TextEditor | undefined;
    const searchBoxDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor('input.background'),
        color: new vscode.ThemeColor('input.foreground'),
    });

    context.subscriptions.push(
        vscode.commands.registerCommand('taskManager.search', async () => {
            const query = await vscode.window.showInputBox({
                placeHolder: 'Search tasks...',
                prompt: 'Enter text to filter tasks'
            });
            
            if (query !== undefined) {
                taskDataProvider.setSearchQuery(query);
            }
        })
    );

    // Register refresh command
    context.subscriptions.push(
        vscode.commands.registerCommand('taskManager.refresh', async () => {
            try {
                await taskDataProvider.refresh();
                vscode.window.showInformationMessage('Tasks refreshed successfully');
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to refresh tasks: ${error}`);
            }
        })
    );

    // Register run task command
    context.subscriptions.push(
        vscode.commands.registerCommand('taskManager.runTask', async (taskName: string) => {
            const tasks = await taskService.getTasks();
            const task = tasks.find(t => t.name === taskName);
            if (task) {
                const vsCodeTask = taskService.createVSCodeTask(task);
                vscode.tasks.executeTask(vsCodeTask);
            }
        })
    );
}
