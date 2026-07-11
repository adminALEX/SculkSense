export type AddedDiffLine = {
  file: string;
  line: number;
  content: string;
};

export function parseAddedDiffLines(diff: string): AddedDiffLine[] {
  const results: AddedDiffLine[] = [];
  let currentFile = '';
  let newLine = 0;

  for (const raw of diff.split('\n')) {
    if (raw.startsWith('+++ b/')) {
      currentFile = raw.slice(6);
      continue;
    }

    const hunkMatch = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      newLine = Number(hunkMatch[1]) - 1;
      continue;
    }

    if (raw.startsWith('+') && !raw.startsWith('+++')) {
      newLine += 1;
      results.push({
        file: currentFile,
        line: newLine,
        content: raw.slice(1),
      });
      continue;
    }

    if (raw.startsWith(' ')) {
      newLine += 1;
      continue;
    }

    if (raw.startsWith('-') && !raw.startsWith('---')) {
      continue;
    }
  }

  return results;
}

export function formatFailure(
  message: string,
  file?: string,
  line?: number,
): string {
  if (file && line) {
    return `${message}\n\n${file}:${line}`;
  }

  return message;
}
