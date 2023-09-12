import * as webpack from 'webpack';
import * as url from 'url';
import * as cheerio from 'cheerio';
import * as Chain from '@gem-mine/webpack-chain';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

import { createPlugin } from '../../utils';
import { HtmlData } from '../../html';

interface HtmlInjectOption {
  data: HtmlData;
  htmlXmlMode: boolean;
}

class HtmlInjectPlugin {
  private data: HtmlData;
  private htmlXmlMode: boolean;

  public constructor(options: HtmlInjectOption) {
    this.data = options.data;
    this.htmlXmlMode = options.htmlXmlMode;
  }

  public apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap(
      'HtmlInjectPlugin',
      (compilation) => {
        // @ts-ignore
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('HtmlInjectPlugin', (data, callback) => {
          const $ = cheerio.load(data.html, {
            decodeEntities: false,
            xmlMode: this.htmlXmlMode,
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
      });
  }

  private _processScripts($: CheerioStatic, publicPath: string) {
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

export function htmlInjectPlugin(config: Chain, options: { [key: string]: any }) {
  createPlugin(
    config,
    'HtmlInjectPlugin',
    HtmlInjectPlugin,
    {
      ...options,
    }
  );
}
