import * as vscode from "vscode";
import { Config } from "./config";

export interface FileStrings {
  pathSuffix: string;
  activeFileExtension: string | undefined;
}

export interface EntryToItemOption {
  config: Config;
  entries: [string, vscode.FileType][];
  targetUri: vscode.Uri;
  isImageOnly: boolean | undefined;
  fileStrings: FileStrings;
  replaceRange: vscode.Range | undefined;
}
