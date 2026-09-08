import * as vscode from "vscode";
import { extractName } from "./fileUtils";

/**
 * Builds the base CompletionItem for a file/folder entry. Directories get
 * a trailing slash inserted and re-trigger suggestions so the user can
 * keep drilling into subfolders without retyping "/".
 */
export function createCompletionItem(
  type: vscode.FileType,
  name: string,
): vscode.CompletionItem {
  const isDir = type === vscode.FileType.Directory;

  const item = new vscode.CompletionItem(
    name,
    isDir ? vscode.CompletionItemKind.Folder : vscode.CompletionItemKind.File,
  );

  // Add a trailing slash automatically if it is a directory
  if (isDir) {
    item.insertText = `${name}/`;
    item.command = {
      command: "editor.action.triggerSuggest",
      title: "Re-trigger completions",
    };
  }

  return item;
}

/**
 * Attaches a hover-preview thumbnail for image files via a trusted
 * MarkdownString, so the user can see the image before inserting it.
 */
export function attachImagePreview(
  item: vscode.CompletionItem,
  name: string,
  targetUri: vscode.Uri,
): void {
  const imageUri = vscode.Uri.joinPath(targetUri, name);
  const docs = new vscode.MarkdownString(
    `![preview](${imageUri.toString()}|width=300)`,
  );
  docs.isTrusted = true;
  item.documentation = docs;
}

/**
 * True when the active file's extension and the target file's extension
 * are both listed together in one of the user's configured extension
 * groups (e.g. [".ts", ".tsx"]).
 */
function _isSameGroup(
  extensionGroup: string[][],
  extensions: { activeFileExtension: string; targetFileExtension: string },
): boolean {
  const { activeFileExtension, targetFileExtension } = extensions;
  const isMatch = extensionGroup?.some(
    (group) =>
      group.includes(activeFileExtension) &&
      group.includes(targetFileExtension),
  );

  return isMatch;
}

/**
 * Drops the target file's extension from the inserted text when it shares
 * an extension group with the currently active file.
 */
export function applyExtensionGroupDrop(
  item: vscode.CompletionItem,
  name: string,
  extensionGroup: string[][],
  extensions: { activeFileExtension: string; targetFileExtension: string },
): void {
  const isMatch = _isSameGroup(extensionGroup, extensions);
  if (isMatch) {
    const fileName = extractName(name);
    item.insertText = new vscode.SnippetString(fileName);
  }
}

/**
 * When the text already typed (pathSuffix) contains a period, avoid
 * duplicating everything up to and including that period by inserting
 * only the remainder of the name past the last period in pathSuffix.
 */
export function deduplicatePeriodSuffix(
  item: vscode.CompletionItem,
  name: string,
  pathSuffix: string,
): void {
  const lastPeriodIndex = pathSuffix.lastIndexOf(".");

  if (lastPeriodIndex !== -1) {
    const remainPath = name.slice(lastPeriodIndex + 1);
    item.insertText = new vscode.SnippetString(remainPath);
  }
}
