import * as vscode from "vscode";
import { entry2item, excludeDir, filterImageEntries } from "../util/completion";
import { PathResolver } from "../resolver/pathResolver";
import { Config } from "../interface/config";
import { EntryConversionOptions } from "../interface/argument";

export class PathCompletionProvider implements vscode.CompletionItemProvider {
  private config;
  constructor(config: Config) {
    this.config = config;
  }

  private extractPathInput(
    linePrefix: string,
    isMarkdown: boolean,
  ):
    | { pathPrefix: string; pathSuffix: string; isImageOnly?: boolean }
    | undefined {
    // 1. Markdown Link & Image Handling: [text](path) or ![alt](path)
    if (isMarkdown) {
      // Group 1: Matches '!' if it exists before '[' to detect image context
      // Group 2: The path inner text
      const mdMatch = linePrefix.match(/(!)?\[.*?\]\(([^)]*)$/);
      if (mdMatch) {
        const isImageOnly = Boolean(mdMatch[1]);
        const rawPath = mdMatch[2];

        // Ignore external URLs, mailto links, and anchor fragments
        if (/^(https?:\/\/|mailto:|ftp:\/\/|#|\/\/)/i.test(rawPath)) {
          return undefined;
        }

        const lastSlashIndex = rawPath.lastIndexOf("/");
        if (lastSlashIndex === -1) {
          return { pathPrefix: "./", pathSuffix: rawPath, isImageOnly };
        }

        return {
          pathPrefix: rawPath.slice(0, lastSlashIndex + 1),
          pathSuffix: rawPath.slice(lastSlashIndex + 1),
          isImageOnly,
        };
      }
    }

    // 2. Standard Quote, Whitespace, or Bare Keyword Handling (e.g., `include includes/` or Ctrl+Space after space)
    // Matches path-like text starting after a quote, tick, whitespace, or beginning of line
    const match = linePrefix.match(/(?:['"`\s]|^)([\w\-./\\@~]*)$/);
    if (!match) {
      return undefined;
    }

    const rawPath = match[1];
    const lastSlashIndex = rawPath.lastIndexOf("/");

    if (lastSlashIndex === -1) {
      // User pressed Ctrl+Space or typed a filename/folder without a slash yet (e.g. `include inc|`)
      // Default pathPrefix to current folder `./`
      return { pathPrefix: "./", pathSuffix: rawPath };
    }

    let pathPrefix = rawPath.slice(0, lastSlashIndex + 1);
    const pathSuffix = rawPath.slice(lastSlashIndex + 1);

    // If prefix doesn't explicitly start with `/`, `./`, `../`, `~`, or `@`, prepend `./` to make it current folder relative
    if (!/^[./~@]+/.test(pathPrefix)) {
      pathPrefix = "./" + pathPrefix;
    }

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
    const { pathPrefix, pathSuffix, isImageOnly } = parsedPath;

    const resolver = new PathResolver(this.config);
    const documentDir = resolver.resolveDirectory(pathPrefix, document.uri);
    const targetUri = vscode.Uri.file(documentDir);
    try {
      let entries = await vscode.workspace.fs.readDirectory(targetUri);

      if (isImageOnly) {
        entries = filterImageEntries(entries);
      }
      const excludedDir = excludeDir(entries, this.config.excludePath);

      const argument: EntryConversionOptions = {
        entries: excludedDir,
        pathSuffix: pathSuffix,
        targetUri: targetUri,
        config: this.config,
      };
      return entry2item(argument);
    } catch (error) {
      return undefined;
    }
  }
}
