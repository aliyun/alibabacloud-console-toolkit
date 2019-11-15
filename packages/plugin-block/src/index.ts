// Reference: https://github.com/umi/blob/dev/packages/umi-build-dev/src/plugins/commands/block
import { join } from 'path';
import { existsSync } from 'fs';

import * as ora from 'ora';
import * as minimist from 'minimist';
import chalk from 'chalk';
import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import { debug, error, exit } from '@alicloud/console-toolkit-shared-utils';

import { getCtx } from './ctx';
import { gitClone, gitUpdate } from './git';
import { installBlockDeps } from './dep';
import details from './help';
import { DEBUG_TAG } from './constants';


export default (api: PluginAPI, config: PluginOptions) => {

  async function add(args: minimist.ParsedArgs) {
    const spinner = ora();
    const url = args._[1];
    if (!url) {
      error(`${chalk.cyan.underline('breezr add <path>')}, path can't be empty`);
      return;
    }
    spinner.start('Parse url and args');
    const useYarn = existsSync(join(api.getCwd(), 'yarn.lock'));
    const defaultNpmClient = useYarn ? 'yarn' : 'npm';

    debug(DEBUG_TAG, `defaultNpmClient: ${defaultNpmClient}`);
    debug(DEBUG_TAG, `args: ${JSON.stringify(args)}`);

    const {
      path: argPath,
      dryRun,
      npmClient = defaultNpmClient,
      skipDependencies
    } = args;

    let path = '';
    if (config.prefix) {
      path = join(config.prefix, argPath);
    } else {
      path = argPath;
    }

    const ctx = getCtx(url, args);
    spinner.succeed();

    // 2. clone git repo
    if (!ctx.isLocal && !ctx.repoExists) {
      await gitClone(ctx, spinner);
    }

    // 3. update git repo
    if (!ctx.isLocal && ctx.repoExists) {
      await gitUpdate(ctx, spinner);
    }

    const pkgPath = join(ctx.sourcePath, 'package.json');
    if (!existsSync(pkgPath)) {
      error(`not find package.json in ${ctx.sourcePath}`);
      exit(-1);
    } else {
      ctx.pkg = require(pkgPath);
    }

    // 4. update depenencies
    if (!skipDependencies) {
      await installBlockDeps({
        ctx,
        npmClient,
        projectPkg: api.service.pkg,
        args,
        cwd: api.getCwd(),
        spinner
      });
    } else {
      debug(DEBUG_TAG,'skip dependencies');
    }

    // 5. Generate files
    spinner.start(`Generate files`);
    spinner.stopAndPersist();
    const BlockGenerator = require('./generator').BlockGenerator;
    try {
      const generator = new BlockGenerator(args._.slice(2), {
        sourcePath: ctx.sourcePath,
        path,
        dryRun,
        api,
        cwd: api.getCwd(),
        env: {
          cwd: api.getCwd(),
        },
        resolved: __dirname,
      });
      await generator.run();
    } catch (e) {
      spinner.fail();
      error(e.toString());
      return;
    }
    spinner.succeed('Generate files');
  }

  api.registerCommand('block', {
    description: 'block related commands, e.g. add',
    usage: `breezr block <command>`,
    details,
  },
  async (args) => {
    args._ = args._.slice(1);
    switch (args._[0]) {
      case 'add':
        await add(args as minimist.ParsedArgs);
        break;
      default:
        error(
          `Please run ${chalk.cyan.underline('breezr help block')} to checkout the usage`,
        );
    }
  });
};
