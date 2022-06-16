import * as path from 'path';
import * as fs from 'fs-extra';

import {
  CommandArgs,
  PluginAPI,
  Service,
} from '@alicloud/console-toolkit-core';
import { BreezrPresetConfig } from '@alicloud/console-toolkit-preset-official';

import { IParams, IUploadConfig } from './types';

export default function docsUpload(
  commandList: CommandArgs,
  api: PluginAPI,
  cwd: string,
  configInfo: IParams
) {
  const { consoleOSId, output } = configInfo;

  const outputPath = path.resolve(cwd, output || 'doc-dist');
  fs.removeSync(outputPath);

  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  const uploadConfig: IUploadConfig = {
    ossDir: process.env.OSS_DIR || commandList.ossDir || 'app/breezr-docs/',
    ossName: process.env.OSS_NAME || commandList.ossName || consoleOSId,
    ossTag: process.env.OSS_Tag || commandList.ossTag || 'latest',
    uploadDir: path.resolve(cwd, output || 'doc-dist'),
    consoleOSId,
  };
  const buildService = new Service({
    cwd,
    config: {
      presets: [
        [
          require.resolve('@alicloud/console-toolkit-preset-official'),
          {
            disablePolyfill: true,
            disableErrorOverlay: true,
            typescript: {
              // @ts-ignore
              disableTypeChecker: true,
              useBabel: true,
            },
            useTerserPlugin: true,
            htmlFileName: path.resolve(__dirname, '../src2/index.html'),
            useHappyPack: false,
            // @ts-ignore
            hashPrefix: consoleOSId,
            // @ts-ignore
            // output: {
            //   path: params.output
            // }
            babelPluginWindRc: false,
            disableUpdator: true,
          } as BreezrPresetConfig,
        ],
      ],
      plugins: [
        [
          '@alicloud/console-toolkit-plugin-os',
          {
            id: consoleOSId,
            cssPrefix: 'html',
          },
        ],
        [require.resolve('./plugins/main-plugin'), configInfo],
        [require.resolve('./plugins/upload-plugin'), uploadConfig],
        require.resolve('./plugins/config-webpack-plugin'),
      ],
    },
  });
  buildService.run('build');
}
