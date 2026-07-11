import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  appendLogLine,
  getLogPath,
  logReviewOutcome,
  logReviewStart,
  readLogLines,
} from '../src/logging/fileLogger.js';

describe('fileLogger', () => {
  let cwd = '';
  let logRoot = '';

  beforeEach(() => {
    logRoot = mkdtempSync(join(tmpdir(), 'skulksense-log-root-'));
    process.env.SKULKSENSE_LOG_DIR = logRoot;
    cwd = mkdtempSync(join(tmpdir(), 'skulksense-project-'));
  });

  afterEach(() => {
    delete process.env.SKULKSENSE_LOG_DIR;
    if (cwd) {
      rmSync(cwd, { recursive: true, force: true });
      cwd = '';
    }
    if (logRoot) {
      rmSync(logRoot, { recursive: true, force: true });
      logRoot = '';
    }
  });

  it('writes review logs under the user log directory', () => {
    logReviewStart(cwd, 'manual');
    logReviewOutcome(
      { status: 'pass', durationMs: 120, model: 'qwen2.5-coder:1.5b' },
      cwd,
    );

    const lines = readLogLines(cwd, 10);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('REVIEW_START trigger=manual');
    expect(lines[0]).toContain(`project=${resolve(cwd)}`);
    expect(lines[1]).toContain('REVIEW_PASS');
    expect(getLogPath(cwd)).toContain(logRoot);
    expect(getLogPath(cwd)).not.toContain(resolve(cwd));
  });

  it('returns recent lines only', () => {
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
