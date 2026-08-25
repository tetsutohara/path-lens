import * as assert from "assert";
import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as os from "os";
import { PathCompletionProvider } from "../provider/pathCompletionProvider";
import path from "path";

suite("PathCompletionProvider Test Suite", () => {
  vscode.window.showInformationMessage("Start PathCompletionProvider Test");

  const config = {
    enable: true,
    alias: { "@": "/src" },
    excludePath: ["**/node_modules/**"],
  };

  const provider = new PathCompletionProvider(config);

  // 1. Test private helper function
  test("extractPathInput Test 1", () => {
    const line = "import x from './src/util";
    const result = (provider as any).extractPathInput(line);

    assert.deepStrictEqual(result, {
      pathPrefix: "./src/",
      pathSuffix: "util",
    });
  });

  test("extractPathInput Test 2", () => {
    const line = "don't include ./src/main.";
    const result = (provider as any).extractPathInput(line);

    assert.deepStrictEqual(result, {
      pathPrefix: "./src/",
      pathSuffix: "main.",
    });
  });

  test("extractPathInput Test 3", () => {
    const line = "import x from 'util";
    const result = (provider as any).extractPathInput(line);

    assert.deepStrictEqual(result, undefined);
  });

  async function createTextDoc(
    dirPath: string,
    content: string,
  ): Promise<vscode.TextDocument> {
    const filePath = path.join(dirPath, "test.txt");
    await fs.writeFile(filePath, content);
    return await vscode.workspace.openTextDocument(filePath);
  }

  test("provideCompletionItems - returns matching files", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "path-completion-test-"),
    );

    try {
      // Create files:
      //
      // tempDir/
      // ├── src/
      // │   ├── hoo.ts
      // │   └── tmp.ts
      // └── test.txt
      //
      await fs.mkdir(path.join(tmpDir, "src"));

      await fs.writeFile(path.join(tmpDir, "src", "hoo.ts"), "");
      await fs.writeFile(path.join(tmpDir, "src", "tmp.ts"), "");

      const doc = await createTextDoc(tmpDir, "./src/");
      const pos = new vscode.Position(0, 6);

      const result = await provider.provideCompletionItems(doc, pos);

      assert.ok(result);
      assert.strictEqual(result.length, 2);

      const labels = result.map((item) => item.label);

      assert.ok(labels.includes("hoo.ts"));
      assert.ok(labels.includes("tmp.ts"));
    } finally {
      fs.rm(tmpDir, { force: true, recursive: true });
    }
  });

  test("provideCompletionItems - returns matching files", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "path-completion-test-"),
    );

    try {
      // Create files:
      //
      // tempDir/
      // ├── src/
      // │   ├── hoo.ts
      // │   └── tmp.ts
      // └── test.txt
      //
      await fs.mkdir(path.join(tmpDir, "src"));

      await fs.writeFile(path.join(tmpDir, "src", "hoo.ts"), "");
      await fs.writeFile(path.join(tmpDir, "src", "tmp.ts"), "");

      const doc = await createTextDoc(tmpDir, "./src/");
      const pos = new vscode.Position(0, 6);

      const result = await provider.provideCompletionItems(doc, pos);

      assert.ok(result);
      assert.strictEqual(result.length, 2);

      const labels = result.map((item) => item.label);

      assert.ok(labels.includes("hoo.ts"));
      assert.ok(labels.includes("tmp.ts"));
    } finally {
      fs.rm(tmpDir, { force: true, recursive: true });
    }
  });

  test("provideCompletionItems - returns undefined when path is not found", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "path-completion-test-"),
    );
    try {
      const doc = await createTextDoc(
        tmpDir,
        "import x from './does-not-exist/",
      );
      const pos = new vscode.Position(0, 32);

      const result = await provider.provideCompletionItems(doc, pos);

      assert.strictEqual(result, undefined);
    } finally {
      fs.rm(tmpDir, { force: true, recursive: true });
    }
  });

  test("provideCompletionItems - returns undefined when no path exists", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "path-completion-test-"),
    );

    try {
      const document = await createTextDoc(tempDir, "import x from 'util");

      const position = new vscode.Position(0, 9);

      const result = await provider.provideCompletionItems(document, position);

      assert.strictEqual(result, undefined);
    } finally {
      await fs.rm(tempDir, {
        recursive: true,
        force: true,
      });
    }
  });

  const configDisable = {
    enable: false,
    alias: { "@": "/src" },
    excludePath: ["**/node_modules/**"],
  };
  const providerDisable = new PathCompletionProvider(configDisable);

  test("provideCompletionItems - returns undefined when extension is switch off", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "path-completion-test-"),
    );

    try {
      const document = await createTextDoc(tempDir, "import x from 'util");

      const position = new vscode.Position(0, 9);

      const result = await providerDisable.provideCompletionItems(
        document,
        position,
      );

      assert.strictEqual(result, undefined);
    } finally {
      await fs.rm(tempDir, {
        recursive: true,
        force: true,
      });
    }
  });
});
