function globToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '§§')
    .replace(/\*/g, '[^/]*')
    .replace(/§§/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`);
}

export function matchesIgnorePattern(
  filePath: string,
  patterns: string[],
): boolean {
  return patterns.some((pattern) => globToRegExp(pattern).test(filePath));
}

export function filterReviewableFiles(
  files: string[],
  ignorePatterns: string[],
): string[] {
  return files.filter((file) => !matchesIgnorePattern(file, ignorePatterns));
}
