import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PRE_COMMIT_HOOK = `if [ -f .skulksense/disabled ]; then
  exit 0
fi
if [ -f ./node_modules/skulksense/dist/cli.js ]; then
  node ./node_modules/skulksense/dist/cli.js review
elif command -v skulksense >/dev/null 2>&1; then
  skulksense review
else
  echo "skulksense: install locally (npm i -D skulksense) or globally (npm i -g skulksense)" >&2
  exit 1
fi
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
