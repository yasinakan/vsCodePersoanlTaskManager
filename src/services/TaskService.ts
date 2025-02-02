import * as vscode from 'vscode';
import * as fs from 'fs';
import { ConfigurationService } from './ConfigurationService';

export interface ITask {
    name: string;
    command: string;
    group?: {
        grand_parent?: string;
        parent?: string;
    };
}

export class TaskService {
    constructor(private configService: ConfigurationService) {}

    async getTasks(): Promise<ITask[]> {
        const taskFilePaths = this.configService.getTaskFilePaths();
        const tasks: ITask[] = [];

        for (const filePath of taskFilePaths) {
            try {
                if (fs.existsSync(filePath)) {
                    const taskData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    tasks.push(...taskData);
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error reading task file ${filePath}: ${error}`);
            }
        }

        return tasks;
    }

    createVSCodeTask(task: ITask): vscode.Task {
        const taskDefinition: vscode.TaskDefinition = {
            type: 'Tasks',
            task: task.name
        };
        const taskExecution = new vscode.ShellExecution(task.command);
        const vsCodeTask = new vscode.Task(
            taskDefinition,
            vscode.TaskScope.Workspace,
            task.name,
            'Tasks',
            taskExecution
        );

        // Set task group if available
        if (task.group) {
            if (task.group.grand_parent === 'build') {
                vsCodeTask.group = vscode.TaskGroup.Build;
            } else if (task.group.grand_parent === 'test') {
                vsCodeTask.group = vscode.TaskGroup.Test;
            }
        }

        return vsCodeTask;
    }
}
