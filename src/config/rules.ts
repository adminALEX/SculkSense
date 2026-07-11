import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import type { SculkSenseConfig } from './defaults.js';

export const DEFAULT_RULES_FILENAME = '.skulksense-rules.md';

export const DEFAULT_RULES_TEMPLATE = `# SkulkSense Review Rules

Add project-specific pre-commit rules below. SkulkSense includes these with its
built-in checks when reviewing staged changes.

## Examples

- Do not commit direct \`fetch\` calls without error handling
- React components must not use inline styles for layout
- Never hardcode API base URLs
`;

export function resolveRulesPath(
  rulesFile: string,
  cwd: string = process.cwd(),
): string {
  return isAbsolute(rulesFile) ? rulesFile : resolve(cwd, rulesFile);
}

export function loadRulesFile(
  rulesFile: string,
  cwd: string = process.cwd(),
): string | null {
  const path = resolveRulesPath(rulesFile, cwd);

  if (!existsSync(path)) {
    return null;
  }

  return readFileSync(path, 'utf-8').trim();
}

export function ensureRulesFile(
  rulesFile: string,
  cwd: string = process.cwd(),
): string {
  const path = resolveRulesPath(rulesFile, cwd);

  if (!existsSync(path)) {
    writeFileSync(path, DEFAULT_RULES_TEMPLATE, 'utf-8');
  }

  return path;
}

export function loadCustomRulesText(
  config: SculkSenseConfig,
  cwd: string = process.cwd(),
): string | null {
  const sections: string[] = [];

  if (config.customInstructions?.trim()) {
    sections.push(config.customInstructions.trim());
  }

  if (config.rulesFile?.trim()) {
    const fileRules = loadRulesFile(config.rulesFile, cwd);
    if (fileRules) {
      sections.push(fileRules);
    }
  }

  if (sections.length === 0) {
    return null;
  }

  return sections.join('\n\n');
}
