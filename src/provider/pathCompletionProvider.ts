import * as vscode from "vscode";
import { entry2item } from "../util/completion";
import { PathResolver } from "../resolver/pathResolver";
import { Config } from "../interface/config";
import { extractExtension } from "../util/fileUtils";
import { getPathReplacementRange } from "../util/range";
import { extractPathInput } from "../util/pathInput";

/** Coordinates document parsing, directory lookup, and completion formatting. */
export class PathCompletionProvider implements vscode.CompletionItemProvider {
  constructor(private readonly config: Config) {}

  private extractPathInput(linePrefix: string, isMarkdown: boolean = false) {
    return extractPathInput(linePrefix, isMarkdown);
  }

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[] | undefined> {
    // Avoid parsing and filesystem work when completions are disabled.
    if (!this.config.enable) {
      return undefined;
    }

    // Only text before the cursor determines the directory and typed filename.
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
      const entries = await vscode.workspace.fs.readDirectory(targetUri);

      return entry2item({
        config: this.config,
        entries,
        targetUri,
        isImageOnly,
        fileStrings: {
          pathSuffix,
          activeFileExtension: extractExtension(document.fileName),
        },
        replaceRange: getPathReplacementRange(document, position),
      });
    } catch {
      // A missing or unreadable directory should leave suggestions unavailable.
      return undefined;
    }
  }
}
