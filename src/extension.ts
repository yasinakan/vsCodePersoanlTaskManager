import * as vscode from 'vscode';
import * as fs from 'fs';
import { TaskDataProvider } from './providers/TaskDataProvider';
import { TaskService } from './services/TaskService';
import { ConfigurationService } from './services/ConfigurationService';

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
}
