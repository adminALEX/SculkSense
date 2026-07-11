import { describe, expect, it } from 'vitest';
import { resolveConfig } from '../src/config/load.js';

describe('resolveConfig', () => {
  it('raises low user timeouts to the minimum', () => {
    const config = resolveConfig({ timeout: 3000 });
    expect(config.timeout).toBe(10_000);
  });

  it('always merges default ignore patterns', () => {
    const config = resolveConfig({
      ignore: ['*.custom'],
    });

    expect(config.ignore).toContain('package-lock.json');
    expect(config.ignore).toContain('*.custom');
  });

  it('applies defaults for missing maxDiffChars', () => {
    const config = resolveConfig({
      timeout: 8000,
    });

    expect(config.maxDiffChars).toBe(4000);
    expect(config.timeout).toBe(10_000);
  });
});
