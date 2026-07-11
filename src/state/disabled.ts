import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const STATE_DIR = '.skulksense';
const DISABLED_FILE = 'disabled';

export function getStateDir(cwd: string = process.cwd()): string {
  return join(cwd, STATE_DIR);
}

export function getDisabledMarkerPath(cwd: string = process.cwd()): string {
  return join(getStateDir(cwd), DISABLED_FILE);
}

export function isReviewStopped(cwd: string = process.cwd()): boolean {
  return existsSync(getDisabledMarkerPath(cwd));
}

export function stopReviews(cwd: string = process.cwd()): void {
  const dir = getStateDir(cwd);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(
    getDisabledMarkerPath(cwd),
    `paused-at=${new Date().toISOString()}\n`,
    'utf-8',
  );
}

export function startReviews(cwd: string = process.cwd()): void {
  const marker = getDisabledMarkerPath(cwd);
  if (existsSync(marker)) {
    rmSync(marker);
  }
}
