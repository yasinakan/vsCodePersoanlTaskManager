"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const cowsay = __importStar(require("cowsay"));
function activate({ subscriptions }) {
    // register a content provider for the cowsay-scheme
    const myScheme = 'cowsay';
    const myProvider = new class {
        constructor() {
            // emitter and its event
            this.onDidChangeEmitter = new vscode.EventEmitter();
            this.onDidChange = this.onDidChangeEmitter.event;
        }
        provideTextDocumentContent(uri) {
            // simply invoke cowsay, use uri-path as text
            return cowsay.say({ text: uri.path });
        }
    };
    subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider));
    // register a command that opens a cowsay-document
    subscriptions.push(vscode.commands.registerCommand('cowsay.say', () => __awaiter(this, void 0, void 0, function* () {
        const what = yield vscode.window.showInputBox({ placeHolder: 'cowsay...' });
        if (what) {
            const uri = vscode.Uri.parse('cowsay:' + what);
            const doc = yield vscode.workspace.openTextDocument(uri); // calls back into the provider
            yield vscode.window.showTextDocument(doc, { preview: false });
        }
    })));
    // register a command that updates the current cowsay
    subscriptions.push(vscode.commands.registerCommand('cowsay.backwards', () => __awaiter(this, void 0, void 0, function* () {
        if (!vscode.window.activeTextEditor) {
            return; // no editor
        }
        const { document } = vscode.window.activeTextEditor;
        if (document.uri.scheme !== myScheme) {
            return; // not my scheme
        }
        // get path-components, reverse it, and create a new uri
        const say = document.uri.path;
        const newSay = say.split('').reverse().join('');
        const newUri = document.uri.with({ path: newSay });
        yield vscode.window.showTextDocument(newUri, { preview: false });
    })));
    // register a command that shows "Hello World"
    subscriptions.push(vscode.commands.registerCommand('helloWorld.show', () => {
        vscode.window.showInformationMessage('Hello World');
    }));
}
//# sourceMappingURL=extension.js.map