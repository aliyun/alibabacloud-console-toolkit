import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import { info } from "@alicloud/console-toolkit-shared-utils";
import { existsSync } from 'fs';
import * as updateNotifier from 'update-notifier';
import * as inquirer from 'inquirer';
import * as rimraf from 'rimraf';
import * as execa from 'execa';
import { resolve } from 'path';

interface IChoice {
  autoUpdate: boolean;
  npmClient: string;
}

export default async (api: PluginAPI, opts: PluginOptions) => {
  const { packagePath, autoUpdate = false } = opts;
  if (!existsSync(packagePath)) {
    return;
  }

  const pkg = require(packagePath);
  if (!pkg.publishConfig || !pkg.publishConfig.registry) {
    pkg.publishConfig = {
      registry: "http://registry.npmjs.org"
    };
  }

  const notifier = updateNotifier({
    pkg,
    shouldNotifyInNpmScript: true,
    updateCheckInterval: 1
    // updateCheckInterval: 1000 * 60
  });

  if (!notifier.update) {
    return;
  }

  notifier.notify({
    defer: false
  });

  if (!autoUpdate) {
    return;
  }

  const projectPkg = api.service.pkg;
  const projectVersion = projectPkg.devDependencies && projectPkg.devDependencies[pkg.name];
  if (notifier.update.type === 'major' || !projectVersion || !projectVersion.startsWith('^')) {
    return;
  }

  const confirm = await inquirer.prompt<IChoice>([{
    type: 'confirm',
    message: `确定升级 ${pkg.name} ?`,
    name: 'autoUpdate',
  }]);

  if (!confirm.autoUpdate) {
    return;
  }

  info("正在删除 node_modules");
  rimraf.sync(resolve(api.getCwd(), 'node_modules'));

  const answer = await inquirer.prompt<IChoice>([{
    type: 'list',
    choices: [{
      name: "npm",
      checked: true // 默认选中
    },
    {
      name: "npm"
    },
    {
      name: "yarn"
    }
    ],
    message: `请选择包管理器类型 ${pkg.name} `,
    name: 'npmClient',
  }]);

  info(`正在执行 ${answer.npmClient} install`);

  await execa(answer.npmClient, ['install'], { cwd: api.getCwd() });

};
