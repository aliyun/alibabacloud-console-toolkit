import * as webpack from 'webpack';
import * as url from 'url';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as cheerio from 'cheerio';
import * as Chain from 'webpack-chain';
import type { CheerioAPI } from 'cheerio';

import { createPlugin } from '../../utils';
import { HtmlData } from '../../html';

interface HtmlInjectOption {
  data: HtmlData;
  htmlXmlMode?: boolean;
  cors?: boolean;
}

class HtmlInjectPlugin {
  private data: HtmlData;
  private cors: boolean;

  public constructor(options: HtmlInjectOption) {
    this.data = options.data;
    this.cors = !!options.cors;
  }

  public apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap(
      'HtmlInjectPlugin',
      (compilation) => {
        // @ts-ignore
        if (this.cors && compilation.hooks.htmlWebpackPluginAlterAssetTags) {
          // @ts-ignore
          compilation.hooks.htmlWebpackPluginAlterAssetTags.tap("HtmlInjectPlugin", (htmlPluginData, callback) => {
            if (htmlPluginData.body?.length) {
              htmlPluginData.body.forEach((tag: any) => {
                if (tag.tagName === 'script') {
                  tag.attributes.crossorigin = 'anonymous';
                }
              });
            }

            if (typeof callback === 'function') {
              callback(null, htmlPluginData); 
            } else {
              return htmlPluginData;
            }
          });
        }

        // @ts-ignore
        if (!compilation.hooks.htmlWebpackPluginAfterHtmlProcessing) {
          return;
        }

        // @ts-ignore
        compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync('HtmlInjectPlugin', (data, callback) => {
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

          let publicPath  = '';
          if (compiler) {
            const { output } = compiler.options;
            if (output && output.publicPath) {
              publicPath = output.publicPath;
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
        compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync('HtmlInjectPlugin', (data, callback) => {
          if (data.html) {
            const oneHtmlPath = path.resolve(compiler.options.output?.path || '', 'one.html');
            fs.ensureFileSync(oneHtmlPath);
            fs.writeFileSync(oneHtmlPath, data.html.replace(/\.alicdn.com/g, '.{{{MAIN_RESOURCE_CDN}}}'));
          } 
  
          callback();
        });
      });
  }

  private _processScripts($: CheerioAPI, publicPath: string) {
    const scripts = $('script');

    scripts.each((_index, script) => {
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
