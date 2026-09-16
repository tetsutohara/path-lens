import * as vscode from "vscode";
import { extractExtension } from "./fileUtils";
import { EntryToItemOption } from "../interface/entryToItem";
import { imageExtensions } from "../types/imageTypes";
import { filterExcludedEntries, filterImageEntries } from "./entryFilters";
import {
  createCompletionItem,
  attachImagePreview,
  applyExtensionGroupDrop,
  deduplicatePeriodSuffix,
} from "./completionItemBuilder";

export function entry2item(
  options: EntryToItemOption,
): vscode.CompletionItem[] {
  // Decompose input
  const { config, targetUri, isImageOnly, fileStrings } = options;
  const { pathSuffix, activeFileExtension } = fileStrings;
  let { entries } = options;

  // Filter by the typed path suffix
  if (pathSuffix) {
    entries = entries.filter(([name]) => name.startsWith(pathSuffix));
  }

  // Get only image files (Markdown)
  if (isImageOnly) {
    entries = filterImageEntries(entries);
  }
  // Exclude folders
  const includedEntries = filterExcludedEntries(entries, config.excludePath);

  return includedEntries.map(([name, type]) => {
    const item = createCompletionItem(type, name);

    const completionItemLastPeriodIndex = name.lastIndexOf(".");
    if (completionItemLastPeriodIndex > 0) {
      const targetFileExtension = extractExtension(name);

      // Add image mini screen
      if (targetFileExtension) {
        const isImage = imageExtensions.includes(targetFileExtension);
        if (isImage) {
          attachImagePreview(item, name, targetUri);
        }
      }

      // Drop the extension if the extension of active file and target file is same
      if (
        activeFileExtension &&
        targetFileExtension &&
        config.extensionGroup?.length
      ) {
        applyExtensionGroupDrop(item, name, config.extensionGroup, {
          activeFileExtension,
          targetFileExtension,
        });
      }
    }

    deduplicatePeriodSuffix(item, name, pathSuffix);

    return item;
  });
}
