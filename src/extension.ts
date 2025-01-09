import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TaskDataProvider } from './providers/TaskDataProvider';
import { TaskService } from './services/TaskService';
import { ConfigurationService } from './services/ConfigurationService';

async function initializeDefaultTaskFile(context: vscode.ExtensionContext) {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    if (!homeDir) return;

    const userTasksDir = path.join(homeDir, '.vscode-tasks');
    const defaultTaskPath = path.join(userTasksDir, 'tasks112.json');

    // Create user tasks directory if it doesn't exist
    if (!fs.existsSync(userTasksDir)) {
        fs.mkdirSync(userTasksDir, { recursive: true });
    }

    // Copy default task file if it doesn't exist
    if (!fs.existsSync(defaultTaskPath)) {
        const defaultTaskSource = path.join(context.extensionPath, 'resources', 'defaultTasks', 'tasks112.json');
        fs.copyFileSync(defaultTaskSource, defaultTaskPath);
    }

    // Update configuration to include the default task file
    const config = vscode.workspace.getConfiguration('myTask');
    const currentPaths = config.get<string[]>('json') || [];
    if (!currentPaths.includes(defaultTaskPath)) {
        await config.update('json', [...currentPaths, defaultTaskPath], vscode.ConfigurationTarget.Global);
    }
}

class MyTaskProvider implements vscode.TaskProvider {
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
    // Initialize default task file
    initializeDefaultTaskFile(context).catch(err => 
        vscode.window.showErrorMessage(`Failed to initialize default task file: ${err}`)
    );

    const configService = new ConfigurationService();
    const taskService = new TaskService(configService);

    // Register the hello world command
    context.subscriptions.push(vscode.commands.registerCommand('helloWorld.show', () => {
        vscode.window.showInformationMessage('Hello World');
    }));

    // Register the task provider with type 'myTask2' to match package.json
    const taskProvider = vscode.tasks.registerTaskProvider('myTask2', new MyTaskProvider(taskService));
    context.subscriptions.push(taskProvider);

    const taskDataProvider = new TaskDataProvider(taskService);
    vscode.window.createTreeView('taskManagerView', {
        treeDataProvider: taskDataProvider
    });

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
