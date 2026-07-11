import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PRE_COMMIT_HOOK = `if [ -f .skulksense/disabled ]; then
  exit 0
fi
node ./node_modules/skulksense/dist/cli.js review
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
