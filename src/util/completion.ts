import * as vscode from "vscode";
import picomatch from "picomatch";
import { EntryConversionOptions } from "../interface/argument";
import { Config } from "../interface/config";

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
  options: EntryConversionOptions,
): vscode.CompletionItem[] {
  const { entries, pathSuffix, targetUri, config } = options;

  return entries.map(([name, type]) => {
    const isDir = type === vscode.FileType.Directory;
    const kind = isDir
      ? vscode.CompletionItemKind.Folder
      : vscode.CompletionItemKind.File;

    const item = new vscode.CompletionItem(name, kind);

    // Attach image documentation if applicable
    item.documentation = buildImagePreview(targetUri, name);

    // Apply insert text & completion commands
    const { insertText, command } = resolveInsertText(
      name,
      isDir,
      pathSuffix,
      config,
    );
    if (insertText) item.insertText = insertText;
    if (command) item.command = command;

    return item;
  });
}
export function excludeDir(
  entries: [string, vscode.FileType][],
  excludePath: string[] | undefined,
): [string, vscode.FileType][] {
  // If no exclude rules exist or array is empty, return all entries
  if (!excludePath || excludePath.length === 0) {
    return entries;
  }

  // Create a matcher function from the configured glob patterns
  const isExcluded = picomatch(excludePath, { dot: true });

  return entries.filter(([name, type]) => {
    const isDir = type === vscode.FileType.Directory;

    // Test exact file/folder name as well as normalized folder path
    const targetPath = isDir ? `${name}/` : name;

    return !isExcluded(targetPath) && !isExcluded(name);
  });
}

export function filterImageEntries(
  entries: [string, vscode.FileType][],
): [string, vscode.FileType][] {
  return entries.filter(([name, type]) => {
    if (type === vscode.FileType.Directory) {
      return true;
    }

    const ext = name.slice(name.lastIndexOf(".") + 1).toLocaleLowerCase();
    return imageExtensions.includes(ext);
  });
}

// Helper: Build documentation preview for images
function buildImagePreview(
  targetUri: vscode.Uri,
  name: string,
): vscode.MarkdownString | undefined {
  const ext = name.split(".").pop()?.toLowerCase();
  if (!ext || !imageExtensions.includes(ext)) return undefined;

  const imageUri = vscode.Uri.joinPath(targetUri, name);
  const docs = new vscode.MarkdownString(
    `![preview](${imageUri.toString()}|width=300)`,
  );
  docs.isTrusted = true;
  return docs;
}

// Helper: Determine insert text overrides (extensions, suffixes, directories)
function resolveInsertText(
  name: string,
  isDir: boolean,
  pathSuffix: string,
  config: Config,
): { insertText?: string | vscode.SnippetString; command?: vscode.Command } {
  if (isDir) {
    return {
      insertText: `${name}/`,
      command: {
        command: "editor.action.triggerSuggest",
        title: "Re-trigger completions",
      },
    };
  }

  const periodIndex = name.lastIndexOf(".");
  let text = name;

  // Handle explicit extension hiding rules (e.g. 'never')
  if (periodIndex > 0) {
    const fileExtension = name.slice(periodIndex + 1).toLowerCase();
    if (config.explicitExtensionRules?.[fileExtension] === "never") {
      text = name.slice(0, periodIndex);
    }
  }

  // Handle user typing past a period (e.g. ./path/file.|)
  const lastPeriodIndex = pathSuffix.lastIndexOf(".");
  if (lastPeriodIndex !== -1) {
    text = name.slice(lastPeriodIndex + 1);
  }

  return text !== name ? { insertText: new vscode.SnippetString(text) } : {};
}
