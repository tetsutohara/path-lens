import * as vscode from "vscode";
import * as path from "path";
import { entry2item } from "../util/util";

export class PathCompletionProvider implements vscode.CompletionItemProvider {
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

    const pathPrefix = linePrefix.slice(startIndex, lastSlashIndex + 1);
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

    const documentDir = path.join(
      path.dirname(document.uri.fsPath),
      pathPrefix,
    );
    const targetUri = vscode.Uri.file(documentDir);
    // TODO: delete large directory from the path completion candidates. (e.g. node_modules)
    try {
      const entries = await vscode.workspace.fs.readDirectory(targetUri);
      return entry2item(entries, pathSuffix);
    } catch (error) {
      return undefined;
    }
  }
}
