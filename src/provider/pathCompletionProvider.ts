import * as vscode from "vscode";
import { entry2item, excludeDir } from "../util/util";
import { PathResolver } from "../resolver/pathResolver";
import { Config } from "../types/types";

export class PathCompletionProvider implements vscode.CompletionItemProvider {
  private config;
  constructor(config: Config) {
    this.config = config;
  }

  private extractPathInput(
    linePrefix: string,
  ): { pathPrefix: string; pathSuffix: string } | undefined {
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
    const linePrefix = document
      .lineAt(position)
      .text.slice(0, position.character);

    const parsedPath = this.extractPathInput(linePrefix);
    if (!parsedPath) {
      return undefined;
    }

    const { pathPrefix, pathSuffix } = parsedPath;

    const resolver = new PathResolver(this.config);
    const documentDir = resolver.resolveDirectory(pathPrefix, document.uri);
    const targetUri = vscode.Uri.file(documentDir);
    try {
      const entries = await vscode.workspace.fs.readDirectory(targetUri);
      const excludedDir = excludeDir(entries, this.config);
      return entry2item(excludedDir, pathSuffix);
    } catch (error) {
      return undefined;
    }
  }
}
