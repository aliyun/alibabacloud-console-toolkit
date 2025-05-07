import * as webpack from 'webpack';
import * as url from 'url';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as cheerio from 'cheerio';
import * as Chain from '@gem-mine/webpack-chain';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import type { CheerioAPI } from 'cheerio';

import { createPlugin } from '../../utils';
import { HtmlData } from '../../html';

interface HtmlInjectOption {
  data: HtmlData;
  htmlXmlMode?: boolean;
  cors?: boolean;
  priority?: 'high' | 'low' | 'auto';
}

class HtmlInjectPlugin {
  private data: HtmlData;
  private cors: boolean;
  private priority?: 'high' | 'low' | 'auto';;

  public constructor(options: HtmlInjectOption) {
    this.data = options.data;
    this.cors = !!options.cors;
    this.priority = options.priority;
  }

  public apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap(
      'HtmlInjectPlugin',
      (compilation) => {
        if (this.cors || this.priority) {
          // @ts-ignore
          HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap('HtmlInjectPlugin', (data, callback) => {
            data.assetTags.scripts.forEach((tag: any) => {
              if (tag?.attributes) {
                if (this.cors) tag.attributes.crossorigin = 'anonymous';
                if (this.priority) tag.attributes.fetchpriority = this.priority;
              }
            })
          });
        }

        // @ts-ignore
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('HtmlInjectPlugin', (data, callback) => {
          const $ = cheerio.load(data.html, {
            xml: {
              decodeEntities: false,
              xmlMode: false,
            }
          });
          // const dom = new JSDOM(data.html);
          // const document = dom.window.document;
          const body = $('body');
          const head = $('head');

          let publicPath: webpack.WebpackOptionsNormalized['output']['publicPath'] = '';
          if (compiler) {
            const { output } = compiler.options;
            if (output && output.publicPath) {
              publicPath = output.publicPath as string;
            }
          }

          this.data.metas.forEach((script) => {
            head.append(script);
          });

          this.data.headscripts.forEach((script) => {
            head.append(script);
          });

          this.data.scripts.forEach((script) => {
            body.append(script);
          });

          this.data.prescripts.forEach((script) => {
            body.prepend(script);
          });

          this._processScripts($, publicPath);

          data.html = $.html();
          callback();
        });

        // @ts-ignore
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('HtmlInjectPlugin', (data, callback) => {
          if (data.html) {
            const oneHtmlPath = path.resolve(compilation.options.output.path || '', 'one.html');
            fs.ensureFileSync(oneHtmlPath);
            fs.writeFileSync(oneHtmlPath, data.html.replace(/\.alicdn.com/g, '.{{{MAIN_RESOURCE_CDN}}}.com'));
          } 

          callback();
        });
      });
  }

  private _processScripts($: CheerioAPI, publicPath: string) {
    const scripts = $('script');

    scripts.each((index, script) => {
      let src = script.attribs['src'];
      if (src && src.startsWith('/') && !src.startsWith('//')) {
        src = url.resolve(publicPath, src.slice(1, src.length));
      }
      $(script).attr('src', src);
    });
  }
}

export function htmlInjectPlugin(config: Chain, options: HtmlInjectOption) {
  createPlugin(
    config,
    'HtmlInjectPlugin',
    HtmlInjectPlugin,
    {
      ...options,
    }
  );
}
