import webpackPlugin from '../src/index';
import { Service } from '@alicloud/console-toolkit-core';
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';

const demoWebpackConfig = require('./demo/webpack.config.js');
async function rmOutput() {
  // Check if the file exists in the current directory.
  // rm -rf Delete dir
  rimraf.sync(demoWebpackConfig.output.path);
}

// prepare test
const service = new Service({ cwd: path.resolve(__dirname, './demo') });
// TODO better to push plugins
service.plugins.push({
  id: 'local:webpack',
  pluginEntry: api => {
    webpackPlugin(api);
    api.registerCommand(
      'webpack',
      {
        description: 'webpack command desc',
        usage: 'webpack command usage'
      },
      async (opts: any) => {
        await api.dispatch('webpack', opts);
      }
    );
    api.registerCommand(
      'webpackServer',
      {
        description: 'webpack dev server desc',
        usage: 'webpack dev server usage'
      },
      async (opts: any) => {
        await api.dispatch('webpackServer', opts);
      }
    );
  }
});

test('register webpack plugin', () => {
  expect(service.hasPlugin('local:webpack')).toBeTruthy();
});

test('run webpack', async () => {
  await rmOutput();
  await service.run('webpack');
  const file = path.resolve(__dirname, './demo/dist/bundle.js');
  expect(fs.existsSync(file)).toBeTruthy();
});

test('build success', async () => {
  await rmOutput();

  const onSuccess = jest.fn();
  await service.run('webpack', {
    onSuccess
  });
  expect(onSuccess).toBeCalled();
});

test('build fail', async () => {
  await rmOutput();

  const onFail = jest.fn();

  await service.run('webpack', {
    config: { context: path.resolve(__dirname) },
    onFail
  });

  expect(onFail).toBeCalled();
});

// test('run webpack watch', async () => {
//   const onSuccess = jest.fn();
//   await service.run('webpack', { watch: true });
//   expect(onSuccess).toBeCalled();
// });

test('webpack dev server', async () => {
  const onServerRunning = jest.fn();
  // service.on('onServerRunning', onServerRunning);
  await service.run('webpackServer', {
    onServerRunning
  });

  expect(onServerRunning).toBeCalled();
});
