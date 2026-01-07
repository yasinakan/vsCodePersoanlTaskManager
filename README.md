# ToolMaster for VS Code

> A powerful task management and visualization extension for Visual Studio Code

[![Version](https://img.shields.io/badge/version-0.0.6-blue.svg)](https://github.com/yasinakan/vsCodePersoanlTaskManager)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.md)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Security](#-security)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Architecture](#-architecture)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

**ToolMaster** is a powerful VS Code extension for managing and visualizing tasks from multiple task definition JSON files. It provides a hierarchical tree view in the VS Code Explorer sidebar, allowing users to organize, search, and execute shell commands efficiently.

### Key Capabilities
- Load tasks from multiple JSON configuration files
- Hierarchical task organization (grand_parent → parent → task)
- Search and filter tasks in real-time
- Execute tasks directly from the tree view
- Auto-initialization with default task templates
- Global configuration support

---

## ✨ Features

### 🗂️ Hierarchical Task Organization
Tasks are organized in a three-level hierarchy:
- **Grand Parent**: Top-level category (e.g., "DefaultTasks1", "DefaultTasks2")
- **Parent**: Sub-category grouping (e.g., "file", "file2")
- **Task**: Individual executable task

### 🌳 Tree View Explorer
- Visual task browser in the VS Code Explorer sidebar
- Expandable/collapsible groups
- Icons for different hierarchy levels
- Click-to-run functionality

### 🔍 Search Functionality
- Real-time task filtering
- Search across task names and group labels
- Quick access to specific tasks

### ⚡ Task Execution
- One-click task execution from the tree view
- Integrated with VS Code's task system
- Shell command execution support

### 🚀 Auto-Initialization
- Automatically creates default task files on first run
- Copies template tasks to user's home directory (`~/.vscode-tasks/`)
- Auto-configures settings

---

## 🔒 Security

⚠️ **IMPORTANT**: This extension executes shell commands from JSON files. Always use trusted sources.

### ⚠️ Potential Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Command Injection** | Arbitrary command execution | Only use trusted task files |
| **Path Traversal** | Unauthorized file access | Verify all file paths |
| **Code Execution** | System-level access | Review commands before running |
| **Malicious JSON** | Unexpected behavior | Validate JSON structure |

### 🛡️ Security Best Practices

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

3. **Validate JSON Content**
   ```json
   // ✅ Safe task example
   {
     "name": "List Files",
     "command": "ls -la",
     "group": {
       "grand_parent": "Utilities",
       "parent": "File Operations"
     }
   ```

### Settings

The extension uses the `Tasks.json` configuration key:

Edit `settings.json`:
```json
{
  "Tasks.json": [
    "C:/Users/YourName/.vscode-tasks/DefaultTasks1.json",
    "C:/Users/YourName/.vscode-tasks/DefaultTasks2.json"
  ] 
}
```

## 📞 Support & Links

- 🐛 **Issues**: [GitHub Issues](https://github.com/yasinakan/vsCodePersoanlTaskManager/issues)
- 📦 **Repository**: [GitHub](https://github.com/yasinakan/vsCodePersoanlTaskManager)
- 👤 **Publisher**: YasinAkan

---

<div align="center">

**Made with ❤️ by Yasin Akan**

⭐ Star us on GitHub — it helps!

</div>

---

*Last Updated: January 7, 2026 | Version 0.0.6

---


## Version History

- **0.0.6** - Current version
  - Task management and visualization
  - Search functionality
  - Auto-initialization

## Similar Extensions
  - https://marketplace.visualstudio.com/items?itemName=cnshenj.vscode-task-manager