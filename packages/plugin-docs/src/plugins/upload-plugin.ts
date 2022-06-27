import fs from 'fs';
import path from 'path';

import globby from 'globby';
import qs from 'query-string';
const aliOss = require('ali-oss');

import { PluginAPI } from '@alicloud/console-toolkit-core';

import { IUploadConfig } from '../types';

export default async (api: PluginAPI, options: IUploadConfig) => {
  const { ossAccessKeyId, ossAccessKeySecret, ossBucket, ossRegion, ossDir, ossName, ossTag, uploadDir, consoleOSId } = options;

  const targetDir = path.join(ossDir, ossName, `-${ossTag}`);

  api.on('onBuildSuccess', async () => {
    console.log('打包成功，开始上传至OSS...');

    if (!fs.existsSync(uploadDir)) {
      throw new Error(`uploadDir "${uploadDir}" does not exist`);
    }
    if (!process.env.OSS_K) {
      throw new Error(
        `process.env.OSS_K must be given (oss的 accessKeyId ，联系萧雨申请)`
      );
    }
    if (!process.env.OSS_S) {
      throw new Error(
        `process.env.OSS_S must be given (oss的 accessKeySecret ，联系萧雨申请)`
      );
    }

    const client = new aliOss({
      bucket: ossBucket,
      region: ossRegion,
      accessKeyId: ossAccessKeyId,
      accessKeySecret: ossAccessKeySecret,
    });

    async function del() {
      let delCount = 0;
      let uploadStatus = true;
      while (uploadStatus) {
        const list = await client.list({
          prefix: targetDir,
          'max-keys': 1000,
        });
        list.objects = list.objects || [];
        const count = list.objects.length;
        if (count === 0) {
          uploadStatus = false;
          break;
        }
        await Promise.all(
          list.objects.map((v: Record<string, any>) => client.delete(v.name))
        );
        delCount += count;
      }
      if (delCount > 0)
        console.log(`Successfully delete ${delCount} old files`);
    }

    await del();

    const files = await globby('**/*', {
      cwd: uploadDir,
    });

    let successCount = 0;
    let manifestURL = '';

    await Promise.all(
      files.map(async (filename) => {
        const res = await client.put(
          path.join(targetDir, filename),
          path.join(uploadDir, filename)
        );
        console.log(
          `[success] [${++successCount}/${files.length}] ${filename}`
        );
        if (
          !filename.startsWith('deps/') &&
          filename.endsWith('manifest.json')
        ) {
          manifestURL = res.url.replace(/^http:/, 'https:');
        }
      })
    );

    const servePath = manifestURL.slice(0, manifestURL.lastIndexOf('/') + 1);
    console.log(`[成功] 上传构建产物 "${uploadDir}" 到OSS路径 "${servePath}"`);

    const previewURL = qs.stringifyUrl({
      url: 'https://xconsole.aliyun-inc.com/demo-playground',
      query: { servePath, consoleOSId },
    });
    console.log(`预览url: ${previewURL} \n可以将它分享给其他同学！`);
  });
};
