import * as vscode from "vscode";
import * as path from "path";
import { entry2item } from "../util/util";

export const pathCompletionProvider =
  vscode.languages.registerCompletionItemProvider(
    "plaintext",
    {
      async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
      ) {
        const linePrefix = document
          .lineAt(position)
          .text.slice(0, position.character);

        const lastSlashIndex = linePrefix.lastIndexOf("/");

        if (lastSlashIndex === -1) {
          return undefined;
        }

        // slice starts 1 to drop the first single/double quotation.
        const pathPrefix = linePrefix.slice(1, lastSlashIndex + 1);
        const pathSuffix = linePrefix.slice(
          lastSlashIndex + 1,
          linePrefix.length,
        );

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
      },
    },
    "/", // triggered whenever a '/' is being typed
  );
