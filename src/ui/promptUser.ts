import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export type CustomRulesInput = {
  customInstructions?: string;
  rulesFile?: string;
};

export function isInteractiveTerminal(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

export async function promptCustomRules(): Promise<CustomRulesInput> {
  if (!isInteractiveTerminal()) {
    return {};
  }

  const rl = createInterface({ input, output });

  try {
    console.log('');
    console.log('Custom review rules (optional)');
    console.log('Add project-specific instructions or a markdown rules file.');
    console.log('');

    const useCustom = await rl.question(
      'Configure custom review rules? (y/N): ',
    );

    if (!/^y(es)?$/i.test(useCustom.trim())) {
      return {};
    }

    console.log('');
    console.log('  1) Type inline instructions');
    console.log('  2) Point to a markdown rules file');
    console.log('');

    const choice = await rl.question('Choose 1 or 2: ');

    if (choice.trim() === '2') {
      const defaultPath = '.skulksense-rules.md';
      const filePath = await rl.question(
        `Rules file path [${defaultPath}]: `,
      );
      return {
        rulesFile: (filePath.trim() || defaultPath).replace(/^\.\//, ''),
      };
    }

    console.log('');
    console.log('Enter custom instructions (press Enter on an empty line to finish):');
    const lines: string[] = [];

    while (true) {
      const line = await rl.question('> ');
      if (!line.trim()) {
        break;
      }
      lines.push(line);
    }

    if (lines.length === 0) {
      return {};
    }

    return { customInstructions: lines.join('\n') };
  } finally {
    rl.close();
  }
}
