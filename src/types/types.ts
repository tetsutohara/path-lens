export interface Config {
  enable: boolean;
  alias?: Record<string, string>;
  excludePath?: string[];
  excludeExtension?: string[];
}

export type PathType = "relative" | "absolute";
