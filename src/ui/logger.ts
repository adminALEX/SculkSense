import chalk from 'chalk';

export const logger = {
  brand(): void {
    console.log(chalk.cyan.bold('🛡 SculkSense'));
  },

  info(message: string): void {
    console.log(message);
  },

  success(message: string): void {
    console.log(chalk.green(message));
  },

  warn(message: string): void {
    console.log(chalk.yellow(message));
  },

  error(message: string): void {
    console.error(chalk.red(message));
  },

  dim(message: string): void {
    console.log(chalk.dim(message));
  },
};
