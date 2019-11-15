import chalk from 'chalk';
import { PLUGIN_NAME } from './constants';

export const warning = (message: string) => {
  console.warn(
    `${chalk.gray(PLUGIN_NAME)}  ${chalk.yellow.bold(message)}`
  );
};
