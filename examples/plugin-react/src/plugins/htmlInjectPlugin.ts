import webpack from 'webpack';
import url from 'url';
import cheerio from 'cheerio';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import type { CheerioAPI } from 'cheerio';

export interface HtmlData {
  head?: string;
  metas?: string[];
  styles?: string[];
  headscripts?: string[];
  prescripts?: string[];
  scripts?: string[];
  body?: string;
}

interface HtmlInjectOption {
  data: HtmlData;
  htmlXmlMode: boolean;
}

export default class HtmlInjectPlugin {
  private data: HtmlData;
  private htmlXmlMode: boolean;

  constructor(options: HtmlInjectOption) {
    this.data = options.data;
    this.htmlXmlMode = options.htmlXmlMode;
  }

  apply(compiler: webpack.Compiler) {
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

          this.data.metas?.forEach((script) => {
            head.append(script);
          });

          this.data.headscripts?.forEach((script) => {
            head.append(script);
          });

          this.data.scripts?.forEach((script) => {
            body.append(script);
          });

          this.data.prescripts?.forEach((script) => {
            body.prepend(script);
          });

          this._processScripts($, publicPath);

          data.html = $.html();
          callback();
        });
      },
    );
  }

  private _processScripts($: CheerioAPI, publicPath: string) {
    const scripts = $('script');

    scripts.each((index, script) => {
      let { src } = script.attribs;
      if (src && src.startsWith('/') && !src.startsWith('//')) {
        src = url.resolve(publicPath, src.slice(1, src.length));
      }
      $(script).attr('src', src);
    });
  }
}
