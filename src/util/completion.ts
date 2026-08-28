import * as vscode from "vscode";
import picomatch from "picomatch";
import { Config } from "../types/types";

export const imageExtensions: readonly string[] = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
  "ico",
  "tiff",
  "tif",
  "avif",
  "heic",
  "heif",
  "raw",
  "cr2",
  "nef",
  "arw",
  "dng",
  "psd",
] as const;

export function entry2item(
  entries: [string, vscode.FileType][],
  pathSuffix: string,
  targetUri: vscode.Uri,
  excludeExtension: string[] | undefined,
): vscode.CompletionItem[] {
  return entries.map(([name, type]) => {
    const isDir = type === vscode.FileType.Directory;

    const item = new vscode.CompletionItem(
      name,
      isDir ? vscode.CompletionItemKind.Folder : vscode.CompletionItemKind.File,
    );

    const completionItemLastPeriodIndex = name.lastIndexOf(".");

    if (completionItemLastPeriodIndex > 0) {
      const fileExtension = name
        .slice(completionItemLastPeriodIndex + 1)
        .toLowerCase();

      // Add image mini screen
      if (imageExtensions.includes(fileExtension)) {
        const imageUri = vscode.Uri.joinPath(targetUri, name);
        const docs = new vscode.MarkdownString(
          `![preview](${imageUri.toString()}|width=300)`,
        );
        docs.isTrusted = true;
        item.documentation = docs;
      }

      if (excludeExtension && excludeExtension.includes(fileExtension)) {
        item.insertText = name.slice(0, completionItemLastPeriodIndex);
      }
    }

    // Prevent duplicated path completion when the user run path completion
    //  just after file extension period (e.g. suppose | as cursor ./my-path/hoo.|)
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

export function excludeDir(
  entries: [string, vscode.FileType][],
  config: Config,
): [string, vscode.FileType][] {
  // If no exclude rules exist or array is empty, return all entries
  if (!config.excludePath || config.excludePath.length === 0) {
    return entries;
  }

  // Create a matcher function from the configured glob patterns
  const isExcluded = picomatch(config.excludePath, { dot: true });

  return entries.filter(([name, type]) => {
    const isDir = type === vscode.FileType.Directory;

    // Test exact file/folder name as well as normalized folder path
    const targetPath = isDir ? `${name}/` : name;

    return !isExcluded(targetPath) && !isExcluded(name);
  });
}
