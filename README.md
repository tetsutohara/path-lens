# path-sense

A fast, feature-rich Path IntelliSense extension for Visual Studio Code.

## Features

* **Blazing Fast Performance:** Instant path completion suggestions as you type.
* **Custom Path Aliases:** Define custom mapping rules directly in your VS Code settings.
* **Flexible Exclusion:** Keep your completions clean by filtering out build folders, binary files, or ignored directories.
* **Image Mini Preview:** Inline image thumbnail preview. (Comming soon)
* **Automatic `tsconfig.json` & `jsconfig.json` Support:** Automatically parses `compilerOptions.paths` to resolve project path aliases without manual configuration. (Comming soon)

## Usage

1. Open any supported file.
2. Type `./`, `../`, or a configured alias (e.g., `@/`) inside a string literal or import statement.
3. Select your path from the completion list.

## Extension Settings

This extension contributes the following settings:

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `pathSense.enable` | `boolean` | `true` | Enable or disable path completion globally. |
| `pathSense.alias` | `object` | `{ "@": "./src" }` | Map custom path aliases to target workspace directories. |
| `pathSense.excludePath` | `array` | `["**/node_modules/**", "**/out/**"]` | Glob patterns or directory paths to exclude from completions. |

## Requirements

No extra dependencies or external tools required! You can use this extension right out of the box.

## Roadmap

- [x] Path alias support
- [x] Directory exclusions
- [ ] Image mini preview

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md) for full version history and updates.

## Contributing

Contributions are always welcome! 
Please read [CONTRIBUTING.md](./.github/CONTRIBUTING.md) to get started with local development and submitting pull requests.

## License

[MIT License](./LICENSE)