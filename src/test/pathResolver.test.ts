import * as os from "os";
import * as assert from "assert";
import * as vscode from "vscode";
import * as fs from "fs/promises";
import { PathResolver } from "../resolver/pathResolver";
import path from "path";
import { Config } from "../interface/config";

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
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "path-resolver-test-"),
    );

    try {
      // Create:
      //
      // tmpDir/
      // └── test.txt
      //
      const filePath = path.join(tmpDir, "test.txt");
      await fs.writeFile(filePath, "");

      const config: Config = {
        enable: true,
        alias: { "@": "/src" },
        excludePath: ["**/node_modules/**"],
      };

      const resolver = new PathResolver(config);

      const doc = await vscode.workspace.openTextDocument(filePath);

      const pathPrefix = "./";
      const result = resolver.resolveDirectory(pathPrefix, doc.uri);

      assert.strictEqual(result, tmpDir);
    } finally {
      await fs.rm(tmpDir, {
        recursive: true,
        force: true,
      });
    }
  });
  test("resolveDirectory - resolves alias from workspace root", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "path-resolver-test-"),
    );

    try {
      // Create:
      //
      // tmpDir/
      // ├── src/
      // └── test.txt
      //
      await fs.mkdir(path.join(tmpDir, "src"));

      const filePath = path.join(tmpDir, "test.txt");
      await fs.writeFile(filePath, "");

      // Make tmpDir the workspace root
      vscode.workspace.updateWorkspaceFolders(
        0,
        vscode.workspace.workspaceFolders?.length ?? 0,
        {
          uri: vscode.Uri.file(tmpDir),
          name: "test-workspace",
        },
      );

      const config: Config = {
        enable: true,
        alias: {
          "@": "${workspaceRoot}/src",
        },
        excludePath: ["**/node_modules/**"],
      };

      const resolver = new PathResolver(config);

      const doc = await vscode.workspace.openTextDocument(filePath);

      const result = resolver.resolveDirectory("@", doc.uri);

      const expectedPath = path.join(tmpDir, "src");

      assert.strictEqual(result, expectedPath);
    } finally {
      await fs.rm(tmpDir, {
        recursive: true,
        force: true,
      });
    }
  });
});
