# ToolMaster - VS Code Extension Documentation

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Security](#security)
4. [Architecture](#architecture)
5. [Installation & Setup](#installation--setup)
6. [Configuration](#configuration)
7. [Usage Guide](#usage-guide)
8. [API Reference](#api-reference)
9. [Development](#development)
10. [File Structure](#file-structure)
11. [Contributing](#contributing)

---

## Overview

**ToolMaster** is a powerful VS Code extension for managing and visualizing tasks from multiple task definition JSON files. It provides a hierarchical tree view in the VS Code Explorer sidebar, allowing users to organize, search, and execute shell commands efficiently.

### Key Capabilities
- Load tasks from multiple JSON configuration files
- Hierarchical task organization (grand_parent → parent → task)
- Search and filter tasks in real-time
- Execute tasks directly from the tree view
- Auto-initialization with default task templates
- Global configuration support

---

## Features

### 1. **Hierarchical Task Organization**
Tasks are organized in a three-level hierarchy:
- **Grand Parent**: Top-level category (e.g., "DefaultTasks1", "DefaultTasks2")
- **Parent**: Sub-category grouping (e.g., "file", "file2")
- **Task**: Individual executable task

### 2. **Tree View Explorer**
- Visual task browser in the VS Code Explorer sidebar
- Expandable/collapsible groups
- Icons for different hierarchy levels
- Click-to-run functionality

### 3. **Search Functionality**
- Real-time task filtering
- Search across task names and group labels
- Quick access to specific tasks

### 4. **Task Execution**
- One-click task execution from the tree view
- Integrated with VS Code's task system
- Shell command execution support

### 5. **Auto-Initialization**
- Automatically creates default task files on first run
- Copies template tasks to user's home directory (`~/.vscode-tasks/`)
- Auto-configures settings

---

## Security

### Security Best Practices

#### For Users

1. **Verify Task Sources**
   ```json
   // ❌ DON'T: Use task files from untrusted sources
   {
     "Tasks.json": [
       "/downloaded/unknown-tasks.json"
     ]
   }
   
   // ✅ DO: Use only your own or verified task files
   {
     "Tasks.json": [
       "~/.vscode-tasks/my-tasks.json"
     ]
   }
   ```

2. **Review Commands Before Execution**
   - Always inspect task definitions before running
   - Be cautious with tasks that:
     - Delete files (`rm`, `del`)
     - Modify system settings
     - Access network resources
     - Execute downloaded scripts

3. **Limit File Permissions**
   - Keep task JSON files readable only by your user
   - Use appropriate file permissions (e.g., `chmod 600` on Unix/Linux)

4. **Validate JSON Content**
   ```json
   // ✅ Safe task example
   {
     "name": "List Files",
     "command": "ls -la",
     "group": {
       "grand_parent": "Utilities",
       "parent": "File Operations"
     }
   }
   
   // ⚠️ Potentially dangerous task
   {
     "name": "Delete All",
     "command": "rm -rf /",  // NEVER USE THIS
     "group": {
       "grand_parent": "Danger",
       "parent": "Destructive"
     }
   }
   ```

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│                   VS Code Extension                     │
├─────────────────────────────────────────────────────────┤
│  extension.ts (Entry Point)                             │
│  ├─ Activation & Initialization                         │
│  ├─ Command Registration                                │
│  └─ Provider Registration                               │
├─────────────────────────────────────────────────────────┤
│  Providers                                              │
│  └─ TaskDataProvider.ts                                 │
│     ├─ Tree Data Provider                               │
│     ├─ Search Filtering                                 │
│     └─ Refresh Logic                                    │
├─────────────────────────────────────────────────────────┤
│  Services                                               │
│  ├─ ConfigurationService.ts                             │
│  │  └─ Configuration Management                         │
│  └─ TaskService.ts                                      │
│     ├─ Task Loading & Parsing                           │
│     ├─ Task Caching                                     │
│     └─ VS Code Task Creation                            │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Configuration** → ConfigurationService reads task file paths
2. **Loading** → TaskService loads and parses JSON task files
3. **Caching** → Tasks are cached for performance
4. **Visualization** → TaskDataProvider builds tree structure
5. **Execution** → Tasks are converted to VS Code tasks and executed

---

## Installation & Setup

### Prerequisites
- Visual Studio Code v1.50.0 or higher
- Node.js (for development)

### Installation

#### From Source
```bash
# Clone the repository
git clone <repository-url>
cd vsCodePersoanlTaskManager

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run in development mode
# Press F5 in VS Code to launch Extension Development Host
```

#### From VSIX
```bash
# Package the extension
npx vsce package

# Install the .vsix file
code --install-extension toolmaster-0.0.3.vsix
```

### First Run
On first activation, the extension will:
1. Create `~/.vscode-tasks/` directory in your home folder
2. Copy `DefaultTasks1.json` and `DefaultTasks2.json` to this directory
3. Update global settings with task file paths

---

## Configuration

### Settings

The extension uses the `Tasks.json` configuration key:

```json
{
  "Tasks.json": [
    "/path/to/your/tasks1.json",
    "/path/to/your/tasks2.json"
  ]
}
```

**Location**: User Settings (Global) or Workspace Settings

**Setting Details**:
- **Type**: Array of strings
- **Default**: `[]`
- **Description**: Paths to task definition JSON files

### Configuration Methods

#### 1. Manual Configuration
Edit `settings.json`:
```json
{
  "Tasks.json": [
    "C:/Users/YourName/.vscode-tasks/DefaultTasks1.json",
    "C:/Users/YourName/.vscode-tasks/DefaultTasks2.json"
  ]
}
```

#### 2. Relative Paths
Use workspace-relative paths:
```json
{
  "Tasks.json": [
    "./tasks/my-tasks.json",
    "./tasks/build-tasks.json"
  ]
}
```

---

## Usage Guide

### Creating Task Files

Task files are JSON arrays containing task objects:

```json
[
  {
    "name": "Build Project",
    "command": "npm run build",
    "type": "shell",
    "scope": "workspace",
    "presentationOptions": {
      "reveal": "always",
      "panel": "shared"
    },
    "problemMatchers": [],
    "group": {
      "grand_parent": "Build",
      "parent": "Production"
    }
  }
]
```

#### Task Object Schema

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ✓ | Unique task name displayed in tree view |
| `command` | string | ✓ | Shell command to execute |
| `type` | string | ✓ | Task type (usually "shell") |
| `scope` | string | | Task scope ("workspace" or "global") |
| `presentationOptions` | object | | Terminal presentation settings |
| `problemMatchers` | array | | Problem matcher patterns |
| `group` | object | | Hierarchical grouping information |
| `group.grand_parent` | string | | Top-level category name |
| `group.parent` | string | | Sub-category name |

### Using the Extension

#### 1. **View Tasks**
- Open the Explorer sidebar (Ctrl+Shift+E / Cmd+Shift+E)
- Find the "Tool Master" tree view
- Expand groups to see tasks

#### 2. **Search Tasks**
- Click the search icon (🔍) in the tree view toolbar
- Enter search query
- Results filter in real-time

#### 3. **Run Tasks**
- Click on any task in the tree view
- Or right-click and select "Run Task"
- Task executes in VS Code's integrated terminal

#### 4. **Refresh Tasks**
- Click the refresh icon (🔄) in the tree view toolbar
- Clears cache and reloads all task files

### Commands

| Command | ID | Description |
|---------|-----|-------------|
| Search Tasks | `taskManager.search` | Opens search input box |
| Refresh Tasks | `taskManager.refresh` | Reloads all tasks from files |
| Run Task | `taskManager.runTask` | Executes selected task |
| Hello World | `helloWorld.show` | Demo command (commented out) |

---

## API Reference

### ConfigurationService

**Purpose**: Manages extension configuration and task file paths

#### Methods

##### `getTaskFilePaths(): string[]`
Returns array of absolute paths to task definition files.
- Resolves relative paths based on workspace root
- Handles `./` prefixed paths

**Example**:
```typescript
const configService = new ConfigurationService();
const paths = configService.getTaskFilePaths();
// Returns: ['/home/user/.vscode-tasks/DefaultTasks1.json', ...]
```

##### `getTasksList(): string[]`
Returns list of task names from configuration.

---

### TaskService

**Purpose**: Handles task loading, caching, and VS Code task creation

#### Interface: ITask

```typescript
interface ITask {
  name: string;
  command: string;
  group?: {
    grand_parent?: string;
    parent?: string;
  };
}
```

#### Methods

##### `async getTasks(forceRefresh: boolean = false): Promise<ITask[]>`
Loads tasks from all configured files.
- **Parameters**:
  - `forceRefresh`: If true, bypasses cache and reloads from disk
- **Returns**: Array of task objects
- **Caching**: Results are cached until `clearCache()` is called

##### `createVSCodeTask(task: ITask): vscode.Task`
Converts ITask to VS Code Task object.
- **Parameters**:
  - `task`: Task object to convert
- **Returns**: VS Code Task ready for execution
- **Features**:
  - Sets task group (Build/Test) based on grand_parent
  - Creates shell execution
  - Configures task scope

##### `clearCache(): void`
Clears the internal task cache.

---

### TaskDataProvider

**Purpose**: Implements VS Code TreeDataProvider for task visualization

#### Classes

##### `GroupItem`
Tree item representing a group (grand_parent or parent)
- **Icons**: `symbol-folder` for grand_parent, `folder-library` for parent

##### `TaskItem`
Tree item representing an executable task
- **Icon**: `terminal-cmd`
- **Command**: Triggers `taskManager.runTask` on click

#### Methods

##### `setSearchQuery(query: string): void`
Sets search filter and refreshes tree view.

##### `async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]>`
Returns child items for tree view.
- No element: Returns top-level groups (grand_parent)
- Grand parent: Returns sub-groups (parent)
- Parent: Returns tasks

##### `async refresh(): Promise<void>`
Reloads all tasks and clears search filter.

---

## Development

### Project Structure

```
vsCodePersoanlTaskManager2/
├── .vscode/
│   ├── launch.json          # Debug configuration
│   ├── settings.json        # Workspace settings
│   └── tasks.json           # Build tasks
├── resources/
│   └── defaultTasks/
│       ├── DefaultTasks1.json  # Template task file
│       └── DefaultTasks2.json  # Template task file
├── src/
│   ├── extension.ts         # Extension entry point
│   ├── providers/
│   │   └── TaskDataProvider.ts  # Tree view provider
│   └── services/
│       ├── ConfigurationService.ts  # Config management
│       └── TaskService.ts   # Task handling
├── out/                     # Compiled JavaScript
├── node_modules/            # Dependencies
├── .gitignore
├── .vscodeignore
├── eslint.config.mjs        # ESLint configuration
├── LICENSE.md
├── package.json             # Extension manifest
├── README.md
└── tsconfig.json            # TypeScript config
```

### Scripts

```bash
# Compile TypeScript
npm run compile

# Watch mode (auto-compile on changes)
npm run watch

# Lint code
npm run lint

# Prepare for publishing
npm run vscode:prepublish
```

### Debugging

1. Open project in VS Code
2. Press **F5** to launch Extension Development Host
3. Set breakpoints in TypeScript files
4. Test extension in new window

### Code Quality

**ESLint Configuration**:
- Uses TypeScript ESLint parser
- Stylistic rules for code consistency
- Naming conventions enforced
- Unused variables checked

**TypeScript Configuration**:
- Target: ES6
- Strict mode enabled
- Source maps for debugging
- CommonJS module system

---

## File Structure

### Extension Manifest (package.json)

Key sections:
- **Activation Events**: When extension loads
  - `onCommand:helloWorld.show`
  - `onStartupFinished`
  - `onLanguage:json`
  
- **Commands**: User-executable commands
  - Search, Refresh, View Task, Run Terminal Command
  
- **Views**: Custom tree views
  - `taskManagerView` in Explorer sidebar
  
- **Configuration**: User settings
  - `Tasks.json`: Array of task file paths

### Source Code

#### extension.ts
Main entry point containing:
- `activate()`: Extension initialization
- `initializeDefaultTaskFiles()`: First-run setup
- `TasksProvider`: Implements vscode.TaskProvider
- Command registrations

#### providers/TaskDataProvider.ts
Tree view implementation:
- `TaskDataProvider`: Main provider class
- `GroupItem`: Group tree items
- `TaskItem`: Task tree items
- Search filtering logic
- Hierarchical tree building

#### services/ConfigurationService.ts
Configuration management:
- Reads `Tasks.json` setting
- Resolves relative paths
- Workspace integration

#### services/TaskService.ts
Task management:
- JSON file parsing
- Task caching
- VS Code task conversion
- Error handling

---

## Contributing

### Guidelines

1. **Code Style**: Follow existing ESLint rules
2. **Testing**: Test all changes in Extension Development Host
3. **Documentation**: Update this file for new features
4. **Commits**: Use clear, descriptive commit messages

### Adding New Features

1. **New Commands**:
   - Add to `package.json` contributes.commands
   - Register in `extension.ts` activate()
   - Implement handler function

2. **New Settings**:
   - Add to `package.json` contributes.configuration
   - Update ConfigurationService as needed

3. **Task Properties**:
   - Update ITask interface in TaskService.ts
   - Modify task parsing logic
   - Update documentation

### Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Run `npm run vscode:prepublish`
4. Package: `npx vsce package`
5. Test .vsix file
6. Publish: `npx vsce publish`

---

## Troubleshooting

### Common Issues

**Tasks not appearing**:
- Check `Tasks.json` setting is configured
- Verify file paths are correct
- Check JSON syntax in task files
- Use "Refresh Tasks" command

**Extension not activating**:
- Check VS Code version (requires 1.50.0+)
- Review activation events in package.json
- Check Extension Host logs

**Tasks won't execute**:
- Verify command syntax in task definition
- Check terminal permissions
- Review VS Code output panel

### Logs

View extension logs:
1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Select "Developer: Show Logs"
3. Choose "Extension Host"

---

## License

MIT License - See [LICENSE.md](LICENSE.md) for details

Copyright (c) 2023 [Your Name]

---

## Version History

- **0.0.3** - Current version
  - Task management and visualization
  - Search functionality
  - Auto-initialization

---

## Support

For issues, feature requests, or contributions:
- GitHub: https://github.com/yasinakan/vsCodePersoanlTaskManager
- Publisher: YasinAkan

---

*Last Updated: January 7, 2026*
