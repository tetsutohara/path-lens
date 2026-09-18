import * as vscode from "vscode";

export function getPathReplacementRange(
  document: vscode.TextDocument,
  position: vscode.Position,
): vscode.Range | undefined {
  const line = document.lineAt(position.line).text;
  const textAfterCursor = line.slice(position.character);
  const textBeforeCursor = line.slice(0, position.character);
  const extensionMatch = textAfterCursor.match(/^\.[a-zA-Z0-9]+/);
  const residue = textBeforeCursor.match(/[^/"'`]*$/);

  let replaceRange;
  if (extensionMatch && residue) {
    const start = new vscode.Position(
      position.line,
      position.character - residue[0].length,
    );
    const end = position.translate(0, extensionMatch[0].length);
    replaceRange = new vscode.Range(start, end);

    return replaceRange;
  }

  return undefined;
}
