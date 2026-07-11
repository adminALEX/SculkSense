import { readFileSync, writeFileSync } from 'node:fs';
import {
  getPreCommitHookContent,
  getPreCommitHookPath,
} from './husky.js';

export function ensureOptimalPreCommitHook(
  cwd: string = process.cwd(),
): boolean {
  const hookPath = getPreCommitHookPath(cwd);

  try {
    const current = readFileSync(hookPath, 'utf8');
    const optimal = getPreCommitHookContent();

    if (current.trim() === optimal.trim()) {
      return false;
    }

    if (!current.includes('skulksense')) {
      return false;
    }

    writeFileSync(hookPath, optimal, { mode: 0o755 });
    return true;
  } catch {
    return false;
  }
}

export function isCommitHookContext(): boolean {
  return (
    process.env.HUSKY === '1' ||
    process.env.HUSKY === 'true' ||
    Boolean(process.env.HUSKY_ROOT)
  );
}
