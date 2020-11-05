#!/usr/bin/env node
const program = require('commander');
const chalk = require('chalk');
const minimist = require('minimist');
const { Service } = require('@alicloud/console-toolkit-core');
const { fork } = require('@alicloud/console-toolkit-shared-utils')
const inquirer = require('inquirer');
const figlet = require('figlet');

/**
 * Call command in service
 * @param {*} cmd
 * @param {*} args
 */
function invokeService(cmd, args) {
  const plugins = [];
  switch (cmd) {
    case 'init':
      plugins.push(require.resolve('@alicloud/console-toolkit-plugin-generator'));
      plugins.push(require.resolve('@alicloud/console-toolkit-plugin-builtin'));
      break;
    case 'build':
      if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'production'
      }
      break;
    case 'start':
    case 'inspect':
      break;
    case 'block':
      plugins.push(require.resolve('@alicloud/console-toolkit-plugin-block'))
    default:
  }

  new Service({ cwd: process.cwd(), plugins: plugins }).run(cmd, args);
}

program.version(require('../package').version).usage('<command> [options]');

program
  .command('start')
  .allowUnknownOption(true)
  .description('start the development environment for wind')
  .option('-o, --open', 'Open browser')
  .option('-p, --port [port]', '')
  .option('-c, --config [config]', '')
  .option('-H, --host [host]', '')
  .option('--mobile', '')
  .action(cmd => {
    const child = fork(require.resolve('./start.js'));
    child.on('message', data => {
      if (process.send) {
        process.send(data);
      }
    });
    child.on('exit', code => {
      if (code === 1) {
        process.exit(code);
      }
    });

    process.on('SIGINT', () => {
      child.kill('SIGINT');
    });
  });

program
  .command('build')
  .allowUnknownOption(true)
  .option('-e, --engine [engine]', 'Build engine type')
  .option('-w, --watch', 'Need watching file changing?')
  .option('--mobile', '')
  .option('--es-module', 'enable es module when build by babel')
  .option('-c, --config [config]', '')
  // presets can use this to provide dynamic build config
  // based on cmdArgs
  .option('--buildMode [buildMode]', 'config webpack build behaviour')
  .option('--publishType [publishType]', 'Build engine type')
  .description('build for wind')
  .action(cmd => {
    invokeService('build', cleanArgs(cmd));
  });

program
  .command('inspect')
  .description('inspect webpack config')
  .option('-e, --env [env]', 'show config by env')
  .action(cmd => {
    invokeService('inspect', cleanArgs(cmd));
  });

program
  .command('init')
  .description('generate wind project')
  .action(() => {
    console.log(
      figlet.textSync('breezr', {
        font: 'Slant'
      })
    );
    inquirer
      .prompt([
        {
          name: 'type',
          type: 'list',
          message: 'which type you wanna generate?',
          choices: [
            'Wind Pro project',
            'Wind project',
            'Widget',
            'Component',
            'Generator'
          ]
        }
      ])
      .then(answers => {
        invokeService('init', answers);
      });
  });

program
  .command('babel')
  .allowUnknownOption(true)
  .description('babel compile')
  .action(cmd => {
    invokeService('babel', cleanArgs(cmd));
  });

program
  .command('help')
  .allowUnknownOption(true)
  .description('breezr help <cmd>')
  .action((cmd, args) => {
    invokeService('help', {
      commandName: cmd,
      ...cleanArgs(args)
    });
  });

program.arguments('<command>').action(cmd => {
  invokeService(cmd, minimist(process.argv.slice(2)));
});

program.parse(process.argv);

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs(cmd) {
  const args = {};
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''));
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key];
    }
  });
  return args;
}

function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
}
