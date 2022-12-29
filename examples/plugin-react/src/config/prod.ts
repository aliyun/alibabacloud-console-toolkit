import { IContext } from '@alicloud/console-toolkit-core';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import getCommonConfig from './common.js';
import type { IConfig } from '../type';

const getProdConfig = (context: IContext, config: IConfig) => {
  const commonConfig = getCommonConfig(context, {
    ...config,
  });

  commonConfig.plugins?.push(new MiniCssExtractPlugin({
    filename: '[name].css',
    chunkFilename: '[id].css',
  }));

  return commonConfig;
};

export default getProdConfig;
