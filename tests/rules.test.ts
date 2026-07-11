import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveConfig } from '../src/config/load.js';
import {
  ensureRulesFile,
  loadCustomRulesText,
  loadRulesFile,
} from '../src/config/rules.js';
import { buildReviewPrompt } from '../src/review/prompt.js';

describe('custom rules', () => {
  let cwd = '';

  afterEach(() => {
    if (cwd) {
      rmSync(cwd, { recursive: true, force: true });
      cwd = '';
    }
  });

  it('loads inline instructions from config', () => {
    cwd = mkdtempSync(join(tmpdir(), 'skulksense-rules-'));
    const config = resolveConfig({
      customInstructions: 'Reject hardcoded API URLs.',
    });

    expect(loadCustomRulesText(config, cwd)).toBe(
      'Reject hardcoded API URLs.',
    );
  });

  it('loads rules from markdown file', () => {
    cwd = mkdtempSync(join(tmpdir(), 'skulksense-rules-'));
    writeFileSync(
      join(cwd, '.skulksense-rules.md'),
      '# Rules\n\n- No console.log in production code',
    );

    const config = resolveConfig({ rulesFile: '.skulksense-rules.md' });
    expect(loadCustomRulesText(config, cwd)).toContain('No console.log');
  });

  it('creates a default rules template file', () => {
    cwd = mkdtempSync(join(tmpdir(), 'skulksense-rules-'));
    ensureRulesFile('.skulksense-rules.md', cwd);
    expect(loadRulesFile('.skulksense-rules.md', cwd)).toContain(
      'SkulkSense Review Rules',
    );
  });

  it('includes custom rules in the review prompt', () => {
    const prompt = buildReviewPrompt('diff --git a/a.ts b/a.ts', 'No TODOs');
    expect(prompt).toContain('PROJECT-SPECIFIC RULES');
    expect(prompt).toContain('No TODOs');
  });
});
