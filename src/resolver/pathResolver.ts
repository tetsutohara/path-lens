import * as vscode from "vscode";
import * as path from "path";
import { Config } from "../interface/config";
import { PathType } from "../types/pathTypes"; // Type
import { getPathReplacementRange } from "../util/range";

export class PathResolver {
  private config;
  constructor(config: Config) {
    this.config = config;
  }

  private pathClassifier(targetPath: string): PathType {
    return targetPath.startsWith(".") ? "relative" : "absolute";
  }

  private aliasResolver(targetPath: string, documentUri: vscode.Uri): string {
    if (!this.config.alias) {
      return targetPath;
    }

    for (let [aliasSymbol, mapPath] of Object.entries(this.config.alias)) {
      // convert "{workspaceRoot}" to "/"
      if (mapPath.startsWith("${workspaceRoot}")) {
        // Workspace-root relative path
        const workspaceFolder =
          vscode.workspace.getWorkspaceFolder(documentUri);
        const rootPath = workspaceFolder ? workspaceFolder.uri.fsPath : "";
        mapPath = mapPath.replace("${workspaceRoot}", rootPath);
      }

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
    const resolvedPath = this.aliasResolver(pathPrefix, documentUri);
    const pathType = this.pathClassifier(resolvedPath);

    if (pathType === "relative") {
      const documentDir = path.dirname(documentUri.fsPath);
      return path.resolve(documentDir, resolvedPath);
    }

    return resolvedPath;
  }
}
