import chalk from 'chalk';
import * as readline  from 'readline';
import { EventEmitter } from 'events';

type Tag = string | null;

export const events = new EventEmitter();

function _log (type: string, tag: Tag, message: string | Error) {
  events.emit('log', {
    message,
    type,
    tag
  });
}

const format = (label: string, msg: string) => {
  return msg.split('\n').map((line: string, i) => {
    return i === 0
      ? `${label} ${line}`
      : line.padStart(chalk.reset(label).length);
  }).join('\n');
};

const chalkTag = (msg: Tag) => chalk.bgBlackBright.white.dim(` ${msg} `);

export const log = (msg = '', tag: Tag = null) => {
  tag ? console.log(format(chalkTag(tag), msg)) : console.log(msg);
  _log('log', tag, msg);
};

export const info = (msg: string, tag: Tag = null) => {
  console.log(format(chalk.bgBlue.black(' INFO ') + (tag ? chalkTag(tag) : ''), msg.toString()));
  _log('info', tag, msg);
};

export const done = (msg: string, tag: Tag = null) => {
  console.log(format(chalk.bgGreen.black(' DONE ') + (tag ? chalkTag(tag) : ''), msg));
  _log('done', tag, msg);
};

export const warn = (msg: string, tag: Tag = null) => {
  console.warn(format(chalk.bgYellow.black(' WARN ') + (tag ? chalkTag(tag) : ''), chalk.yellow(msg)));
  _log('warn', tag, msg);
};

export const error = (msg: string | Error, tag: Tag = null) => {
  console.error(format(chalk.bgRed(' ERROR ') + (tag ? chalkTag(tag) : ''), chalk.red(msg.toString())));
  _log('error', tag, msg);
  if (msg instanceof Error) {
    console.error(msg.stack);
    if (msg.stack) {
      _log('error', tag, msg.stack);
    }
  }
};

export const clearConsole = (title: string) => {
  if (process.stdout.isTTY) {
    const blank = '\n'.repeat(process.stdout.rows ? process.stdout.rows : 0);
    console.log(blank);
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
    if (title) {
      console.log(title);
    }
  }
};
