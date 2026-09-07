export interface Config {
  enable: boolean;
  alias?: Record<string, string>;
  excludePath?: string[];
  extensionGroup?: string[][];
}

export type PathType = "relative" | "absolute";
