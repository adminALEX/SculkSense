import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  getDisabledMarkerPath,
  isReviewStopped,
  startReviews,
  stopReviews,
} from '../src/state/disabled.js';
import { getPreCommitHookContent } from '../src/git/husky.js';

describe('review disabled state', () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('is not stopped by default', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'skulksense-stop-'));
    expect(isReviewStopped(tempDir)).toBe(false);
  });

  it('creates a disabled marker when stopped', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'skulksense-stop-'));
    stopReviews(tempDir);

    expect(isReviewStopped(tempDir)).toBe(true);
    expect(existsSync(getDisabledMarkerPath(tempDir))).toBe(true);
  });

  it('removes the disabled marker when started', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'skulksense-stop-'));
    stopReviews(tempDir);
    startReviews(tempDir);

    expect(isReviewStopped(tempDir)).toBe(false);
    expect(existsSync(getDisabledMarkerPath(tempDir))).toBe(false);
  });
});

describe('pre-commit hook', () => {
  it('skips review when disabled marker exists', () => {
    const hook = getPreCommitHookContent();
    expect(hook).toContain('.skulksense/disabled');
    expect(hook).toContain('exit 0');
    expect(hook).toContain('skulksense/dist/cli.js review');
  });
});
