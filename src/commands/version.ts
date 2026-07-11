import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../ui/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function versionCommand(): void {
  const packagePath = join(__dirname, '..', '..', 'package.json');
  const pkg = JSON.parse(readFileSync(packagePath, 'utf-8')) as {
    version: string;
  };
  logger.brand();
  console.log(`v${pkg.version}`);
}
