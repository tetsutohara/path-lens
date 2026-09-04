import * as vscode from "vscode";
import * as path from "path";
import { Config } from "../interface/config";
import { PathType } from "../types/types";

export class PathResolver {
  private config;
  constructor(config: Config) {
    this.config = config;
  }

  private pathClassifier(targetPath: string): PathType {
    return targetPath.startsWith(".") ? "relative" : "absolute";
  }

  private aliasResolver(targetPath: string): string {
    if (!this.config.alias) {
      return targetPath;
    }

    for (const [aliasSymbol, mapPath] of Object.entries(this.config.alias)) {
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
    const resolvedPath = this.aliasResolver(pathPrefix);
    const pathType = this.pathClassifier(resolvedPath);

    if (pathType === "relative") {
      const documentDir = path.dirname(documentUri.fsPath);
      return path.resolve(documentDir, resolvedPath);
    }

    // Absolute / Workspace-root relative path
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
    const rootPath = workspaceFolder ? workspaceFolder.uri.fsPath : "";

    // Strip leading slash to prevent path.resolve from treating it as OS filesystem root
    const normalizedRelative = resolvedPath.startsWith("/")
      ? resolvedPath.slice(1)
      : resolvedPath;

    return path.resolve(rootPath, normalizedRelative);
  }
}
