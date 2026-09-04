import * as vscode from "vscode";
import { Config } from "../interface/config";

// Helper to fetch and normalize from VS Code
export function getConfig(): Config {
  const workspaceConfig = vscode.workspace.getConfiguration("pathLens");
  return {
    enable: workspaceConfig.get<boolean>("enable", true),
    alias: workspaceConfig.get<Record<string, string>>("alias", {
      "@": "./src",
    }),
    excludePath: workspaceConfig.get<string[]>("excludePath", [
      "**/node_modules/**",
      "**/out/**",
    ]),
    // 1. Core Behavior Strategy
    extensionStrategy: workspaceConfig.get<string>("extensionStrategy", "auto"), // Options: "auto" | "always" | "never" | "if-different"
    // 2. Global Exclusions (Used when strategy is "auto" or "if-different")
    excludeExtension: workspaceConfig.get<string[]>("excludeExtension", [
      "ts",
      "tsx",
    ]),
    // 3. Extension Families (Groupings treated as "same file type")
    extensionGrouping: workspaceConfig.get<Record<string, string[][]>>(
      "extensionGrouping",
      {
        script: [
          ["js", "jsx", "mjs", "cjs"],
          ["ts", "tsx", "mts", "cts"],
          ["css", "scss", "less", "styl"],
        ],
      },
    ),
    // 4. Per-Extension Overrides (Escape hatch for explicit control)
    explicitExtensionRules: workspaceConfig.get<Record<string, string>>(
      "explicitExtensionRules",
      {
        vue: "always",
        json: "never",
        "module.css": "always",
      },
    ),
  };
}
