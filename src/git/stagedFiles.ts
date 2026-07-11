import { runGit } from './run.js';

export async function getStagedFiles(
  cwd: string = process.cwd(),
): Promise<string[]> {
  const output = await runGit(['diff', '--cached', '--name-only'], cwd);
  if (!output) return [];
  return output.split('\n').filter(Boolean);
}
