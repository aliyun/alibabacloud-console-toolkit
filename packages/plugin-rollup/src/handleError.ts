import { relative } from 'path';
import chalk from 'chalk';
import { RollupError } from 'rollup';
import { error, log } from './logger';

const handleError = (err: RollupError): void => {
  let description = err.message || err;

  if (err.name) {
    description = `${err.name}: ${description}`;
  }

  let message = err.plugin
    ? `(${err.plugin} plugin) ${description}`
    : description;

  message = message || err;

  error(chalk.bold(`[!] ${chalk.bold(message.toString())}`));

  if (err.url) {
    log(chalk.cyan(err.url));
  }

  if (err.loc) {
    log(`${relative(process.cwd(), err.loc.file || err.id || 'unknown file')} (${err.loc.line}:${err.loc.column})`);
  } else if (err.id) {
    log(relative(process.cwd(), err.id));
  }

  if (err.frame) {
    log(err.frame);
  }

  if (err.stack) {
    error(err.stack);
  }
};

export default handleError;
