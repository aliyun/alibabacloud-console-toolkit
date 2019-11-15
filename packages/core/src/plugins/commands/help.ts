// Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/commands/help.js
import chalk from 'chalk';
import { getPadLength } from '@alicloud/console-toolkit-shared-utils';
import { PluginAPI } from "../../PluginAPI";
import { Command, CommandArgs } from "../../types/Command";

export default (api: PluginAPI) => {

  function logMainHelp() {
    console.log(
      `\n  Usage: breezr <command> [options]\n` +
      `\n  Commands:\n`
    );
    const commands = api.service.commands;
    const padLength = getPadLength(commands);
    for (const name in commands) {
      if (name !== 'help') {
        const opts = commands[name].option || {};
        console.log(`    ${
          chalk.blue(name.padEnd(padLength))
        }${
          opts.description || ''
        }`);
      }
    }
    console.log(`\n  run ${
      chalk.green(`breezr help [command]`)
    } for usage of a specific command.\n`);
  }

  function logHelpForCommand (name: string, command: Command) {
    if (!command) {
      console.log(chalk.red(`\n  command "${name}" does not exist.`));
    } else {
      const opts = command.option || {};
      if (opts.usage) {
        console.log(`\n  Usage: ${opts.usage}`);
      }
      if (opts.options) {
        console.log(`\n  Options:\n`);
        const padLength = getPadLength(opts.options);
        for (const name in opts.options) {
          console.log(`    ${
            chalk.blue(name.padEnd(padLength))
          }${
            opts.options[name]
          }`);
        }
      }
      if (opts.details) {
        console.log();
        console.log(opts.details.split('\n').map((line: string) => `  ${line}`).join('\n'));
      }
      console.log();
    }
  }

  // command define
  api.registerCommand('help', {
    description: 'show help for breezr',
    usage: ''
  } ,(args: CommandArgs) => {
    const command = args.commandName;
    if (!command) {
      logMainHelp();
    } else {
      logHelpForCommand(command, api.service.commands[command]);
    }
  });
};