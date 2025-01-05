import * as vscode from 'vscode';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    // Get the task file path from settings
    const config = vscode.workspace.getConfiguration('myTask');
    const taskFilePath = config.get<string>('json') || '';

    if (!taskFilePath) {
        vscode.window.showErrorMessage('Task file path not configured. Please set myTask.json in settings.');
        return;
    }

    // Register the hello world command
    context.subscriptions.push(vscode.commands.registerCommand('helloWorld.show', () => {
        vscode.window.showInformationMessage('Hello World');
    }));

    // Register the task provider
    const taskProvider = vscode.tasks.registerTaskProvider('myTask', new MyTaskProvider(taskFilePath));
    context.subscriptions.push(taskProvider);
}

class MyTaskProvider implements vscode.TaskProvider {
    private taskFilePath: string;

    constructor(taskFilePath: string) {
        this.taskFilePath = taskFilePath;
    }

    provideTasks(): vscode.ProviderResult<vscode.Task[]> {
        const tasks: vscode.Task[] = [];
        if (fs.existsSync(this.taskFilePath)) {
            const taskData = JSON.parse(fs.readFileSync(this.taskFilePath, 'utf8'));

            vscode.window.showInformationMessage(`taskData: ${JSON.stringify(taskData)}`);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            taskData.forEach((task: any) => {
                vscode.window.showInformationMessage(`Task: ${JSON.stringify(task)}`);

           

                const taskDefinition: vscode.TaskDefinition = {
                    type: 'myTask',
                    task: task.name
                };
                const taskExecution = new vscode.ShellExecution(task.command);
                const vscodeTask = new vscode.Task(taskDefinition, vscode.TaskScope.Workspace, task.name, 'myTask', taskExecution);
                vscode.window.showInformationMessage(`Successfully detected task ${vscodeTask.name}`);
                tasks.push(vscodeTask);
            });
        } else {
            vscode.window.showErrorMessage(`Task file not found: ${this.taskFilePath}`);
        }
        return tasks;
    }

    resolveTask(_task: vscode.Task): vscode.ProviderResult<vscode.Task> {
        return undefined;
    }
}