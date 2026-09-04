export interface Config {
  enable: boolean;
  alias?: Record<string, string>;
  excludePath?: string[];
  extensionStrategy: string;
  excludeExtension: string[];
  extensionGrouping: Record<string, string[][]>;
  explicitExtensionRules: Record<string, string>;
}
