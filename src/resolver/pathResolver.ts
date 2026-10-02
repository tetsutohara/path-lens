import * as vscode from "vscode";
import * as path from "path";
import { Config } from "../interface/config";
import { PathType } from "../types/pathTypes";

/** Resolves configured aliases and paths relative to the current document. */
export class PathResolver {
  constructor(private readonly config: Config) {}

  private pathClassifier(targetPath: string): PathType {
    // Only dot-prefixed paths are document-relative; other prefixes pass through.
    return targetPath.startsWith(".") ? "relative" : "absolute";
  }

  private aliasResolver(targetPath: string, documentUri: vscode.Uri): string {
    if (!this.config.alias) {
      return targetPath;
    }

    for (let [aliasSymbol, mapPath] of Object.entries(this.config.alias)) {
      // Expand the workspace placeholder using the folder containing this document.
      // Match a complete alias or its directory boundary, avoiding partial names.
      if (mapPath.startsWith("${workspaceRoot}")) {
        // Documents outside a workspace use an empty root, preserving current behavior.
        const workspaceFolder =
          vscode.workspace.getWorkspaceFolder(documentUri);
        const rootPath = workspaceFolder ? workspaceFolder.uri.fsPath : "";
        console.log("workspaceRoot: ", workspaceFolder);
        console.log("rootPath: ", rootPath);
        mapPath = mapPath.replace("${workspaceRoot}", rootPath);
      }

      // Match a complete alias or its directory boundary, avoiding partial names.
      if (
        targetPath === aliasSymbol ||
        targetPath.startsWith(`${aliasSymbol}/`)
      ) {
        return targetPath.replace(aliasSymbol, mapPath);
      }
    }
    return targetPath;
  }

  public resolveDirectory(pathPrefix: string, documentUri: vscode.Uri): string {
    // Classify after alias expansion because a mapping may introduce a relative path.
    const resolvedPath = this.aliasResolver(pathPrefix, documentUri);
    const pathType = this.pathClassifier(resolvedPath);

    if (pathType === "relative") {
      const documentDir = path.dirname(documentUri.fsPath);
      return path.resolve(documentDir, resolvedPath);
    }

    return resolvedPath;
  }
}
