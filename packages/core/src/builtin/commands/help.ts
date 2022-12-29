// Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/commands/help.js
import chalk from 'chalk';

import getPadLength from '../../utils/getPadLength.js';
import type { IContext, ICommandArgs, ICommandRegister } from '../../types/service';

export default (context: IContext) => {
  const { name, version } = context;

  function logMainHelp() {
    console.log(
      `\n  Usage: ${name} <command> [options]\n` +
      '\n  Commands:\n',
    );
    const commands = context.getCommands();
    const padLength = getPadLength(commands);
    for (const cName in commands) {
      if (cName !== 'help') {
        const opts = commands[cName].def || {};
        console.log(`    ${
          chalk.blue(cName.padEnd(padLength))
        }${
          opts.description || ''
        }`);
      }
    }
    console.log(`\n  run ${
      chalk.green(`${name} help [command]`)
    } for usage of a specific command.\n`);
  }

  function logHelpForCommand(cName: string, command?: ICommandRegister) {
    if (!command) {
      console.log(chalk.red(`\n  command "${cName}" does not exist.`));
    } else {
      const definition = command.def;
      if (definition.usage) {
        console.log(`\n  Usage: ${definition.usage}`);
      }
      if (definition.options) {
        console.log('\n  Options:\n');
        const padLength = getPadLength(definition.options);
        for (const optName in definition.options) {
          console.log(`    ${
            chalk.blue(optName.padEnd(padLength))
          }${
            definition.options[optName]
          }`);
        }
      }
      if (definition.details) {
        console.log();
        console.log(definition.details.split('\n').map((line: string) => `  ${line}`).join('\n'));
      }
      console.log();
    }
  }

  // command define
  context.registerCommand('help', {
    description: 'show help',
    usage: '',
  }, async (args: ICommandArgs) => {
    const command = args.commandName;
    if (!command) {
      logMainHelp();
    } else {
      logHelpForCommand(command, context.getCommands([command])[0]);
    }
  });
};
