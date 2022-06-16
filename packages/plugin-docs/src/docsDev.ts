import * as path from 'path';
import * as fs from 'fs-extra';

import { CommandArgs, Service } from '@alicloud/console-toolkit-core';
import { BreezrPresetConfig } from '@alicloud/console-toolkit-preset-official';

import IParams from './types/IParams';

export default async function docsDev(
  commandList: CommandArgs,
  cwd: string,
  configInfo: IParams
) {
  const { consoleOSId, output } = configInfo;

  const outputPath = path.resolve(cwd, output || 'doc-dist');
  fs.removeSync(outputPath);

  const devService = new Service({
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
        require.resolve('./plugins/config-webpack-plugin'),
      ],
    },
  });
  devService.run('start');
}
