/**
 * Splits text before the cursor into a directory prefix and a filename suffix.
 * Returns undefined for unsupported input or external Markdown destinations.
 * Parsing is independent of VS Code and does not access the filesystem.
 */
export function extractPathInput(
  linePrefix: string,
  isMarkdown: boolean = false,
):
  | { pathPrefix: string; pathSuffix: string; isImageOnly?: boolean }
  | undefined {
  // Parse Markdown destinations first; they can contain spaces unlike bare paths.
  if (isMarkdown) {
    // Group 1: Matches '!' if it exists before '[' to detect image context
    // Group 2: The path inner text
    const mdMatch = linePrefix.match(/(!)?\[.*?\]\(([^)]*)$/);
    if (mdMatch) {
      const isImageOnly = Boolean(mdMatch[1]);
      const rawPath = mdMatch[2];

      // Ignore external URLs, mailto links, and anchor fragments
      if (/^(https?:\/\/|mailto:|ftp:\/\/|#|\/\/)/i.test(rawPath)) {
        return undefined;
      }

      const lastSlashIndex = rawPath.lastIndexOf("/");
      if (lastSlashIndex === -1) {
        return { pathPrefix: "./", pathSuffix: rawPath, isImageOnly };
      }

      return {
        pathPrefix: rawPath.slice(0, lastSlashIndex + 1),
        pathSuffix: rawPath.slice(lastSlashIndex + 1),
        isImageOnly,
      };
    }
  }

  // Fall back to quoted or bare paths when no Markdown destination is open.
  // Matches path-like text starting after a quote, tick, whitespace, or beginning of line
  const match = linePrefix.match(/(?:['"`\s]|^)([\w\-./\\@~]*)$/);
  if (!match) {
    return undefined;
  }

  const rawPath = match[1];
  const lastSlashIndex = rawPath.lastIndexOf("/");

  if (lastSlashIndex === -1) {
    // User pressed Ctrl+Space or typed a filename/folder without a slash yet (e.g. `include inc|`)
    // Default pathPrefix to current folder `./`
    return { pathPrefix: "./", pathSuffix: rawPath };
  }

  let pathPrefix = rawPath.slice(0, lastSlashIndex + 1);
  const pathSuffix = rawPath.slice(lastSlashIndex + 1);

  // If prefix doesn't explicitly start with `/`, `./`, `../`, `~`, or `@`, prepend `./` to make it current folder relative
  if (!/^[./~@]+/.test(pathPrefix)) {
    pathPrefix = "./" + pathPrefix;
  }

  return { pathPrefix, pathSuffix };
}
