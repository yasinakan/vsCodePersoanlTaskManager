import * as vscode from 'vscode';
import * as path from 'path';

export class ConfigurationService {
    getTaskFilePaths(): string[] {
        const configPaths = vscode.workspace.getConfiguration('Tasks').get<string[]>('json') || [];
        return configPaths.map(configPath => {
            if (configPath.startsWith('./')) {
                return path.join(vscode.workspace.rootPath || '', configPath);
            }
            return configPath;
        });
    }

    getTasksList(): string[] {
        return vscode.workspace.getConfiguration('Tasks').get<string[]>('tasks') || [];
    }
}
