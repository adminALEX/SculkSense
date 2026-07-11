import { runGit } from './run.js';

export async function getStagedDiff(
  cwd: string = process.cwd(),
): Promise<string> {
  return runGit(['diff', '--cached', '--unified=0'], cwd);
}

export function countChangedLines(diff: string): number {
  if (!diff) return 0;

  let count = 0;
  for (const line of diff.split('\n')) {
    if (
      (line.startsWith('+') || line.startsWith('-')) &&
      !line.startsWith('+++') &&
      !line.startsWith('---')
    ) {
      count++;
    }
  }
  return count;
}
