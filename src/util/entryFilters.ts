import * as vscode from "vscode";
import picomatch from "picomatch";
import { imageExtensions } from "../types/imageTypes";

/**
 * Removes entries matched by the user's configured exclude glob patterns.
 * Directories are tested with a trailing slash as well as their bare name,
 * so patterns like `node_modules/` and `node_modules` both work.
 */
export function filterExcludedEntries(
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

/**
 * Keeps directories (so navigation still works) and files whose extension
 * is a known image type. Used when completions are restricted to images
 * (e.g. inside Markdown image syntax).
 */
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
