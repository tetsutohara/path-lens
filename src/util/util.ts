import * as vscode from "vscode";

export function entry2item(
  entries: [string, vscode.FileType][],
  pathSuffix: string,
): vscode.CompletionItem[] {
  return entries.map(([name, type]) => {
    const isDir = type == vscode.FileType.Directory;

    const item = new vscode.CompletionItem(
      name,
      isDir ? vscode.CompletionItemKind.Folder : vscode.CompletionItemKind.File,
    );

    const lastPeriodIndex = pathSuffix.lastIndexOf(".");

    let remainPath;
    if (lastPeriodIndex !== -1) {
      // slice starts 1 to drop the first single/double quotation.
      remainPath = name.slice(lastPeriodIndex + 1, name.length);
      item.insertText = new vscode.SnippetString(remainPath);
    }

    // Add a trailing slash automatically if it is a directory
    if (isDir) {
      item.insertText = `${name}/`;
      item.command = {
        command: "editor.action.triggerSuggest",
        title: "Re-trigger completions",
      };
    }

    return item;
  });
}
