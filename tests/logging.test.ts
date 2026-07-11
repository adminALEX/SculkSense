import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  appendLogLine,
  getLogPath,
  logReviewOutcome,
  logReviewStart,
  readLogLines,
} from '../src/logging/fileLogger.js';

describe('fileLogger', () => {
  let cwd = '';

  afterEach(() => {
    if (cwd) {
      rmSync(cwd, { recursive: true, force: true });
      cwd = '';
    }
  });

  it('writes review start and outcome logs', () => {
    cwd = mkdtempSync(join(tmpdir(), 'skulksense-log-'));

    logReviewStart(cwd, 'manual');
    logReviewOutcome(
      { status: 'pass', durationMs: 120, model: 'qwen2.5-coder:1.5b' },
      cwd,
    );

    const lines = readLogLines(cwd, 10);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('REVIEW_START trigger=manual');
    expect(lines[1]).toContain('REVIEW_PASS');
    expect(lines[1]).toContain('duration=120ms');
    expect(getLogPath(cwd)).toContain('.skulksense/review.log');
  });

  it('returns recent lines only', () => {
    cwd = mkdtempSync(join(tmpdir(), 'skulksense-log-'));

    appendLogLine('line-1', cwd);
    appendLogLine('line-2', cwd);
    appendLogLine('line-3', cwd);

    const lines = readLogLines(cwd, 2);
    expect(lines).toEqual([
      expect.stringContaining('line-2'),
      expect.stringContaining('line-3'),
    ]);
  });
});
