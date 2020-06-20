import { extname } from 'path';
import * as less from 'less';
import * as postcss from 'postcss';
import * as autoprefixer from 'autoprefixer';
import * as fs from 'fs-extra';
import * as copydir from 'copy-dir';

import { PluginAPI } from '@alicloud/console-toolkit-core';

interface ILessOption {
  src: string;
  sourceMap: boolean;
  dest: string;
  lib: string;
  postcss: boolean;
}

export default (api: PluginAPI, config: ILessOption) => {

  api.registerAPI('less', async (opts: ILessOption) => {
    const option = {
      ...config,
      ...opts
    };
    if (!fs.existsSync(option.src)) {
      return;
    }
    const lessText = await fs.readFile(option.src, 'UTF-8');
    const css = await api.dispatch<string, string>('lessRender', lessText);
    const result = postcss([
      autoprefixer(
        {
          browsers: [
            '> 0%',
            'not ie <= 9',
          ],
        }
      )
    ])
      .process(css, {
        from: option.src,
        to: option.dest
      });

    if (option.sourceMap && result.map) {
      await fs.writeFile(`${option.dest}.map`, result.map);
    }

    if (result.css) {
      await fs.writeFile(`${option.dest}`, result.css);
    }
  });

  api.registerAPI('lessRender', async (source: string) => {
    return new Promise((resolve, reject) => {
      less.render(source, (error, output) => {
        if (!error) {
          resolve(output?.css);
        } else {
          reject(error);
        }
      });
    });
  });

  api.on('onBabelBuildEnd', async () => {
    // if (!fs.existsSync(config.src)) {
    //   return;
    // }
    copydir.sync(config.src, config.lib, 
      (stat: string, filepath: string, filename: string) => {
        if(stat === 'file' && extname(filepath) === '.less') {
          return true;
        }
        return false;
      });
  });
};
