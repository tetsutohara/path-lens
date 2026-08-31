import * as vscode from "vscode";
import { entry2item, excludeDir } from "../util/completion";
import { PathResolver } from "../resolver/pathResolver";
import { Config } from "../types/types";

export class PathCompletionProvider implements vscode.CompletionItemProvider {
  private config;
  constructor(config: Config) {
    this.config = config;
  }

  private extractPathInput(
    linePrefix: string,
    isMarkdown: boolean,
  ): { pathPrefix: string; pathSuffix: string } | undefined {
    // 1. Markdown Link & Image Handling: [text](path) or ![alt](path)
    if (isMarkdown) {
      // Matches `[link](` or `![alt](` right up to the cursor
      const mdMatch = linePrefix.match(/!?\[.*?\]\(([^)]*)$/);
      if (mdMatch) {
        const rawPath = mdMatch[1];
        // Ignore external URLs, mailto links, and anchor fragments
        if (/^(https?:\/\/|mailto:|ftp:\/\/|#|\/\/)/i.test(rawPath)) {
          return undefined;
        }

        const lastSlashIndex = rawPath.lastIndexOf("/");
        if (lastSlashIndex === -1) {
          return { pathPrefix: "./", pathSuffix: rawPath };
        }

        return {
          pathPrefix: rawPath.slice(0, lastSlashIndex + 1),
          pathSuffix: rawPath.slice(lastSlashIndex + 1),
        };
      }
    }

    // 2. Standard quote/whitespace path handling
    const lastSlashIndex = linePrefix.lastIndexOf("/");
    if (lastSlashIndex === -1) {
      return undefined;
    }

    // Find the last opening delimiter (quote, backtick, or whitespace) before the slash
    const match = linePrefix.match(/['"`\s]([^\s'"`]*)$/);
    const startIndex = match ? linePrefix.length - match[1].length : 0;

    let pathPrefix = linePrefix.slice(startIndex, lastSlashIndex + 1);
    const pathSuffix = linePrefix.slice(lastSlashIndex + 1);

    return { pathPrefix, pathSuffix };
  }

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[] | undefined> {
    // Terminate plugin
    if (!this.config.enable) {
      return undefined;
    }

    const linePrefix = document
      .lineAt(position)
      .text.slice(0, position.character);

    const isMarkdown = document.languageId === "markdown";
    const parsedPath = this.extractPathInput(linePrefix, isMarkdown);
    if (!parsedPath) {
      return undefined;
    }

    const { pathPrefix, pathSuffix } = parsedPath;

    const resolver = new PathResolver(this.config);
    const documentDir = resolver.resolveDirectory(pathPrefix, document.uri);
    const targetUri = vscode.Uri.file(documentDir);
    try {
      const entries = await vscode.workspace.fs.readDirectory(targetUri);
      const excludedDir = excludeDir(entries, this.config.excludePath);
      return entry2item(
        excludedDir,
        pathSuffix,
        targetUri,
        this.config.excludeExtension,
      );
    } catch (error) {
      return undefined;
    }
  }
}
