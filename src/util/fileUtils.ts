export function extractExtension(fileName: string): string | undefined {
  const lastPeriodIndex = fileName.lastIndexOf(".");
  if (lastPeriodIndex !== -1) {
    return fileName.slice(lastPeriodIndex + 1);
  }

  // e.g. ~/projects/hoo/.gitignore
  return undefined;
}

export function extractName(fileName: string): string {
  const lastPeriodIndex = fileName.lastIndexOf(".");
  if (lastPeriodIndex !== -1) {
    return fileName.slice(0, lastPeriodIndex);
  }

  // e.g. ~/projects/hoo/.gitignore
  return fileName;
}
