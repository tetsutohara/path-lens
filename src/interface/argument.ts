import * as vscode from "vscode";
import { Config } from "./config";

export interface EntryConversionOptions {
  entries: [string, vscode.FileType][];
  pathSuffix: string;
  targetUri: vscode.Uri;
  config: Config;
}
