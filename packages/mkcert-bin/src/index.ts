import * as path from 'path';
import { error, info } from '@alicloud/console-toolkit-shared-utils';

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
      return undefined;
  }
}

export const mkcertVersion = 'v1.4.4';

export function getMkcertBin() {
  const platformIdentifier = getPlatformIdentifier();

  if (!platformIdentifier) {
    return undefined;
  }

  return path.resolve(
    __dirname,
    `../bin/mkcert-${mkcertVersion}-${platformIdentifier}`
  );
}

export async function mkcert2webpack(passInHttps?: boolean | { key: Buffer; cert: Buffer }) {
  // 自动生成 https 证书
  let https = passInHttps;
  if (passInHttps === true) {
    info('HTTPS 已启用，生成自签名证书中……');
    try {
      const webpackMkcert = await import('webpack-mkcert');
      https = await webpackMkcert.default({
        mkcertPath: getMkcertBin(),
        hosts: ['localhost', '127.0.0.1'],
      });
      info('证书生成成功');
    } catch (e) {
      error('证书生成失败');
      throw e;
    }
  }

  if (passInHttps === undefined) {
    console.info('现已支持自动生成 HTTPS 证书，配置 https: true 即可启用');
  }

  return https;
}
