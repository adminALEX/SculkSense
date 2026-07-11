export const DEFAULT_CONFIG = {
  model: 'qwen2.5-coder:1.5b',
  timeout: 3000,
  minChangedLines: 5,
  ignore: [
    '*.md',
    '*.png',
    '*.jpg',
    '*.svg',
    '*.lock',
    'dist/**',
    'build/**',
  ],
} as const;

export type SculkSenseConfig = {
  model: string;
  timeout: number;
  minChangedLines: number;
  ignore: string[];
};
