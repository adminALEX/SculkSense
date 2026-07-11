import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PRE_COMMIT_HOOK = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx sculk-sense review
`;

export function hasHusky(cwd: string = process.cwd()): boolean {
  return existsSync(join(cwd, '.husky'));
}

export function getPreCommitHookContent(): string {
  return PRE_COMMIT_HOOK;
}

export function getPreCommitHookPath(cwd: string = process.cwd()): string {
  return join(cwd, '.husky', 'pre-commit');
}
