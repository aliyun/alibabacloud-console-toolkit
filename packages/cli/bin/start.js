const minimist = require('minimist')
const { Service } = require('@alicloud/console-toolkit-core');

let closed = false;

function onSignal() {
  if (closed) return;
  closed = true;
  process.exit(0);
}

// kill(2) Ctrl-C
process.once('SIGINT', () => onSignal('SIGINT'));
// kill(3) Ctrl-\
process.once('SIGQUIT', () => onSignal('SIGQUIT'));
// kill(15) default
process.once('SIGTERM', () => onSignal('SIGTERM'));

process.env.NODE_ENV = 'development';

const args = minimist(process.argv.slice(2));

new Service({ cwd: process.cwd() }).run('start', args);
