import { join } from 'path';
import { existsSync, readdirSync } from 'fs';
const Generator = require("yeoman-generator");
import { debug } from '@alicloud/console-toolkit-shared-utils';
import { PluginAPI } from '@alicloud/console-toolkit-core';
import { DEBUG_TAG } from './constants';
import replaceContent from './replace';

interface IBlockOption {
  sourcePath: string;
  dryRun: string;
  path: string;
  cwd: string;
  api: PluginAPI;
}

export class BlockGenerator extends Generator {
  private sourcePath: string;
  private dryRun: string;
  private path: string;
  private cwd: string;
  private api: PluginAPI;

  public constructor(args: string | string[], opts: IBlockOption) {
    super(args, opts);

    this.sourcePath = opts.sourcePath;
    this.dryRun = opts.dryRun;
    this.path = opts.path;
    this.cwd = opts.cwd;
    this.api = opts.api;

    this.on('error', (e: Error) => {
      // debug(DEBUG_TAG, e.toString()); // handle the error for aviod throw generator default error stack
      // console.error(e);
    });
  }

  public async writing() {
    let targetPath = join(this.cwd, this.path);
    debug(DEBUG_TAG, `get targetPath ${targetPath}`);

    targetPath = await this._ensurePath(targetPath);

    const blockPath = this.path;

    this.api.emit('onBeforeBlockWriting', { sourcePath: this.sourcePath, blockPath });

    if (this.dryRun) {
      debug(DEBUG_TAG, 'dryRun is true, skip copy files');
      return;
    }
  
    debug(DEBUG_TAG, 'start copy block file to your project...');
    this._writeFile(targetPath, blockPath);
  }

  private async _ensurePath(targetPath: string) {
    let overwrite = false;
    if (existsSync(targetPath)) {
      const result = await this.prompt({
        type: 'confirm',
        name: 'overwrite',
        message: `path ${
          this.path
        } already exist, would you want to overwrite it`,
        // @ts-ignore
        required: true,
        default: this.path,
      });
      overwrite = result.overwrite;
    }

    while(!overwrite && existsSync(targetPath)) {
      this.path = (await this.prompt({
        type: 'input',
        name: 'path',
        message: `please input a new path for it`,
        // @ts-ignore
        required: true,
        default: this.path,
      })).path;

      if (!/^\//.test(this.path)) {
        this.path = `/${this.path}`;
      }

      targetPath = join(this.cwd, this.path);
      debug(DEBUG_TAG, `targetPath exist get new targetPath ${targetPath}`);
    }

    return targetPath;
  }

  private _writeFile(targetPath: string, blockPath: string) {
    ['src', '@'].forEach(folder => {
      const folderPath = join(this.sourcePath, folder);
      const targetFolder = folder === 'src' ? targetPath : this.cwd;
      const options = {
        process(content: string, targetPath: string) {
          content = String(content);

          content = replaceContent(content, {
            path: blockPath,
          });
          return content;
        },
      };
      if (existsSync(folderPath)) {
        readdirSync(folderPath).forEach(name => {
          // ignore the dot files
          if (name.charAt(0) === '.') {
            return;
          }
          const thePath = join(folderPath, name);
          const realTarget = join(targetFolder, name);

          debug(DEBUG_TAG, `copy ${thePath} to ${realTarget}`);
          this.fs.copy(thePath, realTarget, options);
        });
      }
    });
  }
}