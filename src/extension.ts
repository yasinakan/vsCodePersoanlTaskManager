import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate({ subscriptions }: vscode.ExtensionContext) {
    // Get the task file path from settings
    const config = vscode.workspace.getConfiguration('myTask');

    const taskFilePath = config.get<string>('json') || '';

    vscode.window.showInformationMessage(`task file: ${taskFilePath}`);


    if (!taskFilePath) {
        vscode.window.showErrorMessage('Task file path not configured. Please set myTask.json in settings.');
    }

    // Register the hello world command
    subscriptions.push(vscode.commands.registerCommand('helloWorld.show', () => {
        vscode.window.showInformationMessage('Hello World');
    }));

    // Register the printTheTaskJson command
    subscriptions.push(vscode.commands.registerCommand('printTheTaskJson.show', () => {
        if (!taskFilePath) {
            vscode.window.showErrorMessage('Task file path not configured. Please set myTask.json in settings.');
            return;
        }

        const absolutePath = path.resolve(taskFilePath);
        fs.readFile(absolutePath, 'utf8', (err, data) => {
            if (err) {
                vscode.window.showErrorMessage(`Error reading task file: ${err.message}`);
                return;
            }

            vscode.window.showInformationMessage(`Task file content:\n${data}`);
        });
    }));

    // Watch for settings changes
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('myTask.json')) {
            const newConfig = vscode.workspace.getConfiguration('myTask');
            const newPath = newConfig.get<string>('json');
            vscode.window.showInformationMessage(`Task file path updated to: ${newPath}`);
        }
    });
}