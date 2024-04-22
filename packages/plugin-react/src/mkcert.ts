import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import { error, getEnv, info } from '@alicloud/console-toolkit-shared-utils';
import { getMkcertBin } from '@alicloud/mkcert-bin';

export default async function (api: PluginAPI, options: PluginOptions) {
  // 自动生成 https 证书
  if (options.https === true) {
    if (getEnv().isDev()) {
      info('HTTPS 已启用，生成自签名证书中……');
      try {
        const webpackMkcert = await import('webpack-mkcert');
        options.https = await webpackMkcert.default({
          mkcertPath: getMkcertBin(),
          hosts: ['localhost', '127.0.0.1'],
        });
        info('证书生成成功');
      } catch (e) {
        error('证书生成失败');
        throw e;
      }
    }
  } else if (options.https === false || options.https === undefined) {
    console.info('现已支持自动生成 HTTPS 证书，配置 https: true 即可启用');
  }
}
