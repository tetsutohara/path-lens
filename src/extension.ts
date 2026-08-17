import * as vscode from "vscode";
import { pathCompletionProvider } from "./provider/pathCompletionProvider.ts";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(pathCompletionProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
