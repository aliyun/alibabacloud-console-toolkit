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
    ossAccessKeyId: process.env.OSS_K || commandList['oss-access-key-id'],
    ossAccessKeySecret: process.env.OSS_S || commandList['oss-access-key-secret'],
    ossBucket: process.env.OSS_BUCKET || commandList['oss-bucket'] || 'opensource-microapp',
    ossRegion: process.env.OSS_REGION || commandList['oss-region'] || 'oss-cn-hangzhou',
    ossDir: process.env.OSS_DIR || commandList['oss-dir'] || 'app/breezr-docs/',
    ossName: process.env.OSS_NAME || commandList['oss-name'] || consoleOSId,
    ossTag: process.env.OSS_Tag || commandList['oss-tag'] || 'latest',
    uploadDir: path.resolve(cwd, output || 'doc-dist'),
    consoleOSId,
  };

  if (!configInfo.storeUrl) {
    configInfo.storeUrl = `https://${uploadConfig.ossBucket}.${uploadConfig.ossRegion}.aliyuncs.com/${uploadConfig.ossDir}${uploadConfig.ossName}/-${uploadConfig.ossTag}/`;
  }

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
