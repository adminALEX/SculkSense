export const DEFAULT_CONFIG = {
  model: 'qwen2.5-coder:1.5b',
  timeout: 10000,
  minChangedLines: 5,
  maxDiffChars: 4000,
  ignore: [
    '*.md',
    '*.png',
    '*.jpg',
    '*.svg',
    '*.lock',
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'dist/**',
    'build/**',
  ],
} as const;

export type SculkSenseConfig = {
  model: string;
  timeout: number;
  minChangedLines: number;
  maxDiffChars: number;
  ignore: string[];
  customInstructions?: string;
  rulesFile?: string;
};
