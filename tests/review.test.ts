import { describe, it, expect } from 'vitest';
import { countChangedLines } from '../src/git/diff.js';
import { parseReviewResponse } from '../src/review/parser.js';
import {
  filterReviewableFiles,
  matchesIgnorePattern,
} from '../src/review/filters.js';
import { DEFAULT_CONFIG } from '../src/config/defaults.js';

describe('countChangedLines', () => {
  it('counts added and removed lines', () => {
    const diff = `diff --git a/foo.ts b/foo.ts
--- a/foo.ts
+++ b/foo.ts
@@ -1 +1,2 @@
+added
-old`;
    expect(countChangedLines(diff)).toBe(2);
  });

  it('returns 0 for empty diff', () => {
    expect(countChangedLines('')).toBe(0);
  });
});

describe('parseReviewResponse', () => {
  it('parses PASS', () => {
    expect(parseReviewResponse('PASS')).toEqual({ status: 'pass' });
  });

  it('parses FAIL with reason', () => {
    expect(parseReviewResponse('FAIL:\nPossible null access.')).toEqual({
      status: 'fail',
      reason: 'Possible null access.',
    });
  });

  it('skips malformed response', () => {
    expect(parseReviewResponse('maybe pass?')).toEqual({
      status: 'skip',
      reason: 'Malformed AI response',
    });
  });
});

describe('ignore filters', () => {
  it('matches glob patterns', () => {
    expect(matchesIgnorePattern('README.md', ['*.md'])).toBe(true);
    expect(matchesIgnorePattern('src/index.ts', ['*.md'])).toBe(false);
    expect(matchesIgnorePattern('dist/bundle.js', ['dist/**'])).toBe(true);
  });

  it('filters reviewable files', () => {
    const files = ['src/index.ts', 'README.md', 'dist/out.js'];
    const result = filterReviewableFiles(files, DEFAULT_CONFIG.ignore);
    expect(result).toEqual(['src/index.ts']);
  });
});
