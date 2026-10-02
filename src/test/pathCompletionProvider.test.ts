import * as assert from "assert";
import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as os from "os";
import { PathCompletionProvider } from "../provider/pathCompletionProvider";
import path from "path";
import { getConfig } from "../util/config";

suite("PathCompletionProvider Test Suite", () => {
  vscode.window.showInformationMessage("Start PathCompletionProvider Test");

  const config = getConfig();
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

    assert.deepStrictEqual(result, {
      pathPrefix: "./",
      pathSuffix: "util",
    });
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

      const position = new vscode.Position(0, document.lineAt(0).text.length);

      const result = await provider.provideCompletionItems(document, position);

      assert.deepStrictEqual(result, []);
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

  test("provideCompletionItems - [markdown] return only image files", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "path-completion-test-"),
    );

    try {
      // Create files:
      //
      // tmpDir/
      // ├── hoo.png
      // ├── tmp.webp
      // ├── bar.txt
      // └── test.md
      //
      await fs.writeFile(path.join(tmpDir, "hoo.png"), "");
      await fs.writeFile(path.join(tmpDir, "tmp.webp"), "");
      await fs.writeFile(path.join(tmpDir, "bar.txt"), "");

      const filePath = path.join(tmpDir, "test.md");
      await fs.writeFile(filePath, "![image](./)");
      const doc = await vscode.workspace.openTextDocument(filePath);
      const pos = new vscode.Position(0, 11);
      const result = await provider.provideCompletionItems(doc, pos);

      assert.ok(result);
      assert.strictEqual(result.length, 2);

      const labels = result.map((item) => item.label);

      assert.ok(labels.includes("hoo.png"));
      assert.ok(labels.includes("tmp.webp"));
    } finally {
      fs.rm(tmpDir, { force: true, recursive: true });
    }
  });

  test("provideCompletionItems - exclude extension string when the extensions of active and target files are same", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "path-completion-test-"),
    );

    try {
      // Create files:
      //
      // tmpDir/
      // ├── hoo.js
      // ├── tmp.ts
      // ├── bar.jsx
      // └── test.js
      //
      await fs.writeFile(path.join(tmpDir, "hoo.js"), "");
      await fs.writeFile(path.join(tmpDir, "tmp.ts"), "");
      await fs.writeFile(path.join(tmpDir, "bar.jsx"), "");

      const filePath = path.join(tmpDir, "test.js");
      await fs.writeFile(filePath, "import {z} from ''");
      const doc = await vscode.workspace.openTextDocument(filePath);
      const pos = new vscode.Position(0, doc.lineAt(0).text.length - 1);
      const result = await provider.provideCompletionItems(doc, pos);

      assert.ok(result);

      const hooItem = result.find((item) => item.label === "hoo.js");
      const barItem = result.find((item) => item.label === "bar.jsx");

      assert.ok(hooItem);
      assert.ok(barItem);

      assert.strictEqual(
        (hooItem.insertText as vscode.SnippetString).value,
        "hoo",
      );
      assert.strictEqual(
        (barItem.insertText as vscode.SnippetString).value,
        "bar",
      );
    } finally {
      fs.rm(tmpDir, { force: true, recursive: true });
    }
  });
});
