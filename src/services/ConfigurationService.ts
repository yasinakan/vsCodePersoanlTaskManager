import * as vscode from 'vscode';

export class ConfigurationService {
    getTaskFilePaths(): string[] {
        return vscode.workspace.getConfiguration('myTask').get<string[]>('json') || [];
    }

    getTasksList(): string[] {
        return vscode.workspace.getConfiguration('myTask').get<string[]>('tasks') || [];
    }
}
