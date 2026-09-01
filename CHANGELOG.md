# Change Log

All notable changes to the `path-lnes` extension will be documented in this file.

See [Keep a Changelog](https://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [1.4.0] - 2026-09-01

### Added

- Support for bare and implicit relative paths without requiring explicit `./` or `/` prefixes (e.g., Pug `include` directives).
- Default path resolution to the current directory (`./`) when no directory separator has been typed yet.
- Single quotes (`'`), double quotes (`"`), and backticks (`` ` ``) as completion trigger characters in `registerCompletionItemProvider`.

## [1.3.0] - 2026-08-31

### Added

- Add support for Markdown link (`[text](path)`) and image (`![alt](path)`) path completion.
- Add automatic filtering to show only image files and directories when completing Markdown image links.

## [1.2.0] - 2026-08-28

### Added

- Add `pathLens.excludeExtension` configuration setting.
- Add support for stripping file extensions from completion insertions based on user settings.

## [1.1.0] - 2026-08-25

### Added

- Add `pathSense.enable` configuration code to toggle extension path autocompletion on or off.

## [1.0.0] - 2026-08-24

### Added

- Add image preview tooltips to autocomplete suggestions.

## [0.1.3] - 2026-08-23

### Fixed

- Fix extension name from `path-sense` to `path-lens`.

## [0.1.2] - 2026-08-22

### Fixed

- Fix `publisher` on `package.json`.

## [0.1.1] - 2026-08-22

### Added

- Add extension icon.

## [0.1.0] - 2026-08-22

### Added

- Add `getConfig` helper to dynamically load settings from `settings.json`.

### Refactored

- Replaced hardcoded configuration logic in `extension.ts` with workspace configuration reader.

## [0.0.3] - 2026-08-20

### Added

- Add `PathResolver` to resolve path alias.

## [0.0.2] - 2026-08-17

### Added

- Add `pathCompletionProvider` to provide path completion.

## [0.0.1] - 2026-08-12

### Added

- Set up the development environment.
- Add `README.md`.
- Add the MIT `LICENSE`.
- Configure Prettier, Husky, and lint-staged.
- Add contribution guidelines.
- Add the repository URL and publisher name to `package.json`.
- Initial release.

[1.4.0]: https://github.com/tetsutohara/path-lens/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/tetsutohara/path-lens/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/tetsutohara/path-lens/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/tetsutohara/path-lens/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/tetsutohara/path-lens/compare/v0.1.3...v1.0.0
[0.1.3]: https://github.com/tetsutohara/path-lens/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/tetsutohara/path-lens/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/tetsutohara/path-lens/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/tetsutohara/path-lens/compare/v0.0.3...v0.1.0
[0.0.3]: https://github.com/tetsutohara/path-lens/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/tetsutohara/path-lens/compare/v0.0.1...v0.0.2
