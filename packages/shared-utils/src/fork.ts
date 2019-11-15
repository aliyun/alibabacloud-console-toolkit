import { fork as forkChild } from 'child_process';
import { debug } from './debug';

export const DONE = 'DONE';
export const STARTING = 'STARTING';
export const RESTART = 'RESTART';

function send(message: any) {
  if (process.send) {
    debug('shared-utils' ,`send ${JSON.stringify(message)}`);
    process.send(message);
  }
}

export function fork(scriptPath: string) {
  const execArgv = process.execArgv.slice(0);

  const child = forkChild(scriptPath, process.argv.slice(2), { execArgv });

  child.on('message', data => {
    const type = (data && data.type) || null;
    if (type === RESTART) {
      child.kill();
      fork(scriptPath);
    }
    send(data);
  });

  return child;
}
