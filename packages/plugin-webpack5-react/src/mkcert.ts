import { PluginAPI, PluginOptions } from '@alicloud/console-toolkit-core';
import { error, getEnv, info } from '@alicloud/console-toolkit-shared-utils';
import * as path from 'path';

function getPlatformIdentifier() {
  switch (`${process.platform}-${process.arch}`) {
    case 'win32-arm64':
      return 'windows-arm64.exe';
    case 'win32-x64':
    case 'win32-amd64':
      return 'windows-amd64.exe';
    case 'linux-arm64':
      return 'linux-arm64';
    case 'linux-arm':
      return 'linux-arm';
    case 'linux-x64':
    case 'linux-amd64':
      return 'linux-amd64';
    case 'darwin-arm64':
      return 'darwin-arm64';
    case 'darwin-x64':
    case 'darwin-amd64':
      return 'darwin-amd64';
    default:
      error(
        `${process.platform}-${process.arch} 平台不支持自动生成 HTTPS 证书，请自行生成后传入 https`
      );
      throw new Error('Unsupported platform');
  }
}

const mkcertVersion = 'v1.4.4';

function resolveMkcertPath() {
  const platformIdentifier = getPlatformIdentifier();
  return path.resolve(
    __dirname,
    `../mkcert-bin/mkcert-${mkcertVersion}-${platformIdentifier}`
  );
}

export default async function (api: PluginAPI, options: PluginOptions) {
  // 自动生成 https 证书
  if (options.https === true) {
    if (getEnv().isDev()) {
      info('HTTPS 已启用，生成自签名证书中……');
      try {
        const webpackMkcert = await import('webpack-mkcert');
        options.https = await webpackMkcert.default({
          mkcertPath: resolveMkcertPath(),
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
