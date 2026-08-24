import * as vscode from "vscode";
import { Config } from "../types/types";

// Helper to fetch and normalize from VS Code
export function getConfig(): Config {
  const workspaceConfig = vscode.workspace.getConfiguration("pathLens");
  return {
    enable: workspaceConfig.get<boolean>("enable", true),
    alias: workspaceConfig.get<Record<string, string>>("alias", {}),
    excludePath: workspaceConfig.get<string[]>("excludePath", []),
  };
}
