import * as vscode from "vscode";
import { EntryToItemOption } from "../interface/entryToItem";
import { filterExcludedEntries, filterImageEntries } from "./entryFilters";
import { createEntryCompletionItem } from "./completionItemBuilder";

/** Filters directory entries before delegating each surviving entry to the builder. */
export function entry2item(
  options: EntryToItemOption,
): vscode.CompletionItem[] {
  const { config, isImageOnly, fileStrings } = options;
  const { pathSuffix } = fileStrings;
  let { entries } = options;

  // Prefix matching is case-sensitive, matching the existing completion behavior.
  if (pathSuffix) {
    entries = entries.filter(([name]) => name.startsWith(pathSuffix));
  }

  // Keep folders available so image completions can navigate into subdirectories.
  if (isImageOnly) {
    entries = filterImageEntries(entries);
  }

  const includedEntries = filterExcludedEntries(entries, config.excludePath);
  return includedEntries.map(([name, type]) =>
    createEntryCompletionItem(name, type, options),
  );
}
