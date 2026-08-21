import * as assert from "assert";
import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as os from "os";
import { PathResolver } from "../resolver/pathResolver";
import path from "path";
import { Config } from "../types/types";

suite("PathResolver Test Suite", () => {
  // 1. Test private helper function
  test("pathClassifier Test 1", () => {
    const config: Config = {
      enable: true,
      excludePath: ["**/node_modules/**"],
    };
    const resolver = new PathResolver(config);

    const testPath = "./test/";
    const result = (resolver as any).pathClassifier(testPath);

    assert.strictEqual(result, "relative");
  });

  test("pathClassifier Test 3", () => {
    const config: Config = {
      enable: true,
      excludePath: ["**/node_modules/**"],
    };
    const resolver = new PathResolver(config);

    const testPath = "/test";
    const result = (resolver as any).pathClassifier(testPath);

    assert.strictEqual(result, "absolute");
  });

  // Test alias when no aliases are defined
  test("aliasResolver Test 1", () => {
    const config: Config = {
      enable: true,
      excludePath: ["**/node_modules/**"],
    };
    const resolver = new PathResolver(config);

    const targetPath = "@/util";
    const result = (resolver as any).aliasResolver(targetPath);

    assert.strictEqual(result, "@/util");
  });

  // Test alias when @ alias is defined
  test("aliasResolver Test 2", () => {
    const config: Config = {
      enable: true,
      alias: { "@": "/src" },
      excludePath: ["**/node_modules/**"],
    };
    const resolver = new PathResolver(config);

    const targetPath = "@/util";
    const result = (resolver as any).aliasResolver(targetPath);

    assert.strictEqual(result, "/src/util");
  });

  async function createTextDoc(dirPath: string): Promise<vscode.TextDocument> {
    const filePath = path.join(dirPath, "test.txt");
    await fs.writeFile(filePath, "test");
    return await vscode.workspace.openTextDocument(filePath);
  }

  test("resolveDirectory 1", async () => {
    const config: Config = {
      enable: true,
      alias: { "@": "/src" },
      excludePath: ["**/node_modules/**"],
    };
    const resolver = new PathResolver(config);

    // 1. Resolve relative to process.cwd() or extension root
    const workspaceDir = path.resolve(
      __dirname,
      "../../src/test/test-workspace",
    );
    const filePath = path.join(workspaceDir, "test.txt");

    // Ensure directory exists & create dummy file
    await fs.mkdir(workspaceDir, { recursive: true });
    await fs.writeFile(filePath, "");

    const doc = await vscode.workspace.openTextDocument(filePath);

    const pathPrefix = "./";
    const result = resolver.resolveDirectory(pathPrefix, doc.uri);

    assert.strictEqual(result, workspaceDir);
  });

  test("resolveDirectory 2", async () => {
    const config: Config = {
      enable: true,
      alias: { "@": "/src" },
      excludePath: ["**/node_modules/**"],
    };
    const resolver = new PathResolver(config);

    // 1. Resolve relative to process.cwd() or extension root
    const workspaceDir = path.resolve(
      __dirname,
      "../../src/test/test-workspace",
    );
    const filePath = path.join(workspaceDir, "test.txt");

    // Ensure directory exists & create dummy file
    await fs.mkdir(workspaceDir, { recursive: true });
    await fs.writeFile(filePath, "");

    const doc = await vscode.workspace.openTextDocument(filePath);

    const pathPrefix = "@/";
    const result = resolver.resolveDirectory(pathPrefix, doc.uri);

    // 2. Since test-workspace is inside the open extension project,
    // getWorkspaceFolder resolves against the workspace root.
    const expectedPath = path.resolve(process.cwd(), "src");

    assert.strictEqual(result, expectedPath);
  });
});
