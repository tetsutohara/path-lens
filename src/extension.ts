import * as vscode from "vscode";
import { PathCompletionProvider } from "./provider/pathCompletionProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const provider = new PathCompletionProvider();

  const disposable = vscode.languages.registerCompletionItemProvider(
    { scheme: "file" },
    provider,
    "/",
    ".",
    "@",
    "~",
  );
  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
