import { resolve } from 'path';
import { writeFile } from 'fs';
import { promisify } from 'util';
import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import * as storybook from '@storybook/react/standalone';
import { DYNAMIC_CONFIG_PATH } from './constants';

const writeFileAsync = promisify(writeFile);

export default (api: PluginAPI, opts: PluginOptions) => {
  api.registerCommand(
    'start-storybook',
    {
      description: 'start story board',
      usage: 'start story board',
    },
    async args => {
      // set the env to devlopment by default
      process.env.NODE_ENV = process.env.NODE_ENV || 'development';

      await writeDynamicConfig(api, opts);

      storybook({
        mode: 'dev',
        port: args.port || 9000,
        configDir: resolve(__dirname, '../.storybook'),
      });
    }
  );
};

async function writeDynamicConfig(api: PluginAPI, opts: PluginOptions) {
  // 从breezr实例获取配置，写入文件，提供给.storybook/webpack.config.js
  // 这些配置是动态的，只能在运行时知道
  const cwd = api.getCwd();

  let userProvideWebpackChangerPath = resolve(
    cwd,
    'stories/webpack.stories.js'
  );
  let userProvideWebpackChanger;
  try {
    userProvideWebpackChanger = require(userProvideWebpackChangerPath);
    if (userProvideWebpackChanger.default)
      userProvideWebpackChanger = userProvideWebpackChanger.default;
  } catch (error) {
    /* 用户没有提供webpack扩展函数也没有关系 */
  }

  const dynamicConfig = {
    cwd,
    webpackConfigPaths: [...(opts.webpackConfigPaths || [])],
  };
  if (userProvideWebpackChanger)
    dynamicConfig.webpackConfigPaths.push(userProvideWebpackChangerPath);

  await writeFileAsync(DYNAMIC_CONFIG_PATH, JSON.stringify(dynamicConfig));
}
