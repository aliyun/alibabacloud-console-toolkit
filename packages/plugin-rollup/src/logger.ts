import chalk from 'chalk';
import colorize from 'json-colorizer';

export type AnyFunction = (...args: any[]) => any;
export type StringHandler = (str: string, ...restArgs: any[]) => any;

/**
 * Compose multiple functions to single one
 * @param fns
 * @returns
 */
const compose = (...fns: AnyFunction[]): AnyFunction => fns.reduce(
  (a, b) => (...args) => a(b(...args)), arg => arg
);

/**
 * @param messages
 */
const joinMessages = (...messages: string[]) => messages.join('');

/**
 * Create logger function with joined messages
 * @param fns
 */
const createLogger = (...fns: StringHandler[]) => compose(...fns, joinMessages);

/**
 * Print normal message to console
 * @param messages
 */
export const log = createLogger(console.log);

/**
 * Print successful message with green color to console
 * @param {...String} messages
 */
export const success = createLogger(console.log, chalk.green.bold);

/**
 * Print warning message with yellow color to console
 * @param {...String} messages
 */
export const warning = createLogger(console.warn, chalk.yellow.bold);

/**
 * Print error message with red color to console
 * @param {...String} messages
 */
export const error = createLogger(console.error, chalk.red.bold);

/**
 * Print colorized json data to console
 * @param {String|Object} message
 */
export const json = compose(
  console.log,
  colorize,
  val => (typeof val === 'string' ? val : JSON.stringify(val))
);
