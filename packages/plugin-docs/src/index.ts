import * as path from 'path';
import * as fs from 'fs-extra';
import * as globby from 'globby';
import 'dotenv/config';

import { getEnv } from '@alicloud/console-toolkit-shared-utils';
import { PluginAPI, CommandArgs } from '@alicloud/console-toolkit-core';

import docsDev from './docsDev';
import docsBuild from './docsBuild';
import docsUpload from './docsUpload';
import { IParams } from './types';

export type { IParams as DocsPluginConfig } from './types';

export default async (api: PluginAPI, options: IParams) => {
  const env = getEnv();
  const cwd = env.workingDir ?? process.cwd();
  if (env.isCloudBuild() && env.buildDestDir) {
    options.output = env.buildDestDir;
  } else {
    options.output = options.output ?? 'doc-dist';
  }
  if (!options.getDemos) {
    const baseDir = path.resolve(cwd, 'demos');
    // 默认从demos目录查找demo
    if (fs.existsSync(baseDir)) {
      options.getDemos = () => {
        const paths = globby.sync('**/*.demo.tsx', { cwd: baseDir });
        return paths.map((relativePath: string) => {
          //  const fileName = path.basename(relativePath)
          const demoName = relativePath.replace(/\.demo\.tsx?$/, '');
          // 对于每个demo，要返回demo key和demo路径
          return {
            key: demoName,
            path: path.resolve(baseDir, relativePath),
          };
        });
      };
    }
  }
  if (!options.getMarkdownEntries) {
    const baseDir = path.resolve(cwd, 'docs');
    const READMEPath = path.resolve(cwd, 'README.md');
    options.getMarkdownEntries = () => {
      const result: { key: string; path: string }[] = [];
      if (fs.existsSync(READMEPath)) {
        result.push({
          key: 'README',
          path: READMEPath,
        });
      }
      if (fs.existsSync(baseDir)) {
        const paths = globby.sync('**/*.doc.md?(x)', { cwd: baseDir });
        result.push(
          ...paths.map((relativePath: string) => {
            //  const fileName = path.basename(relativePath)
            const docName = relativePath.replace(/\.doc\.mdx?$/, '');
            // 对于每个doc，要返回key和路径
            return {
              key: `docs/${docName}`,
              path: path.resolve(baseDir, relativePath),
            };
          })
        );
      }
      return result;
    };
  }
  if (!options.getTypeInfoEntries) {
    const baseDir = path.resolve(cwd, 'src/types');
    if (fs.existsSync(baseDir)) {
      options.getTypeInfoEntries = () => {
        const paths = globby.sync('**/*.type.ts?(x)', { cwd: baseDir });
        return paths.map((relativePath: string) => {
          const typeName = relativePath.replace(/\.type\.tsx?$/, '');
          return {
            key: `types/${typeName}`,
            path: path.resolve(baseDir, relativePath),
          };
        });
      };
    }
  }

  options.consoleOSId = options.consoleOSId || 'console-os-demos';

  if (options.consoleOSId.includes('/') || options.consoleOSId.includes('\\'))
    throw new Error(
      `consoleOSId 不能包含'/'和'\\'符号，您可以用'-'或'_'来代替`
    );

  api.registerCommand(
    'docs-dev',
    {
      description: 'generate locally developed online documentation',
      usage: 'docs:dev [options]',
      options: {},
    },
    (commandInfo: CommandArgs) => docsDev(commandInfo, cwd, options)
  );
  api.registerCommand(
    'docs-build',
    {
      description: 'building online documentation',
      usage: 'docs:build [options]',
      options: {},
    },
    (commandInfo: CommandArgs) => docsBuild(commandInfo, cwd, options)
  );
  api.registerCommand(
    'docs-upload',
    {
      description: 'upload locally built online document files',
      usage: 'docs:upload [options]',
      options: {},
    },
    (commandInfo: CommandArgs) => docsUpload(commandInfo, api, cwd, options)
  );
};
