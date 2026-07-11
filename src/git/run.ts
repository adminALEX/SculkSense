import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function runGit(
  args: string[],
  cwd: string = process.cwd(),
): Promise<string> {
  const { stdout } = await execFileAsync('git', args, {
    cwd,
    maxBuffer: 10 * 1024 * 1024,
  });
  return stdout.trim();
}

export async function isGitRepository(
  cwd: string = process.cwd(),
): Promise<boolean> {
  try {
    await runGit(['rev-parse', '--is-inside-work-tree'], cwd);
    return true;
  } catch {
    return false;
  }
}
