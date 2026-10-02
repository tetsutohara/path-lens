import * as vscode from "vscode";

/**
 * Replaces the filename around the cursor when an extension follows it.
 * Otherwise, leaves range selection to VS Code's default completion behavior.
 */
export function getPathReplacementRange(
  document: vscode.TextDocument,
  position: vscode.Position,
): vscode.Range | undefined {
  const line = document.lineAt(position.line).text;
  const textAfterCursor = line.slice(position.character);
  const textBeforeCursor = line.slice(0, position.character);
  const extensionMatch = textAfterCursor.match(/^\.[a-zA-Z0-9]+/);
  // Stop at a directory separator or quote to preserve the surrounding path.
  const residue = textBeforeCursor.match(/[^/"'`]*$/);

  if (extensionMatch && residue) {
    const start = new vscode.Position(
      position.line,
      position.character - residue[0].length,
    );
    const end = position.translate(0, extensionMatch[0].length);
    return new vscode.Range(start, end);
  }

  return undefined;
}
