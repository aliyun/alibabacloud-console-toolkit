import d from 'debug';

const PREFIX = 'breezr';

const loggerMap: {
  [key: string]: debug.IDebugger;
} = {};

export const debug = (tag: string, format: any, ...args: any[]) => {
  const namespace = `${PREFIX}:${tag}`;
  if (!loggerMap[namespace]) {
    loggerMap[namespace] = d(namespace);
  }

  loggerMap[namespace](format, ...args);
};