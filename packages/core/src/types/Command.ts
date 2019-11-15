/**
 * args defination for CommandCallback
 */
export interface CommandArgs {
  [key: string]: any;
}

/**
 * Command callback, it will be a command ran by service
 */
export type CommandCallback = (args: CommandArgs, rawArgs?: string[]) => void;

/**
 * a defination of a commands 
 */
export interface CommandOption {
  /**
   * description of the commands
   */
  description: string;

  /**
   * indicate the usage of this commands like `Usage: cmd1 [options] <fileName>`
   */
  usage: string;

  /**
   * more detail of the
   */
  details?: string;

  /**
   * options for commands like: -x --xxxx
   */
  options?: {
    [key: string]: string;
  };
}

/**
 * Command
 */
export interface Command {
  fn: CommandCallback;
  option: CommandOption;
}

export interface CommandMap {
  [key: string]: Command;
}
