import * as vscode from 'vscode';
import * as fs from 'fs';
import { ConfigurationService } from './ConfigurationService';

export interface ITask {
    name: string;
    command: string;
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
            type: 'myTask2',
            task: task.name
        };
        const taskExecution = new vscode.ShellExecution(task.command);
        return new vscode.Task(
            taskDefinition,
            vscode.TaskScope.Workspace,
            task.name,
            'myTask2',
            taskExecution
        );
    }
}
