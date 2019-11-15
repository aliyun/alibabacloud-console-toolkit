import { isArray } from 'util';
import { PluginAPI } from '@alicloud/console-toolkit-core';

type HtmlDataKey = 'head' | 'metas' | 'styles' | 'headscripts' | 'prescripts' | 'scripts';

export interface HtmlData {
  head: string;
  metas: string[];
  styles: string[];
  headscripts: string[];
  prescripts: string[];
  scripts: string[];
  body: string;
}

export default function(api: PluginAPI) {

  const htmlData: HtmlData = {
    head: "",
    metas: [],
    styles: [],
    headscripts: [],
    prescripts: [],
    scripts: [],
    body: ''
  };

  const addToData = (name: HtmlDataKey) => (data: string) => {
    const field = htmlData[name];
    if (isArray(field)) {
      field.push(data);
    } else {
      // @ts-ignore
      htmlData[name] = data;
    }
  };

  api.registerSyncAPI('addHtmlMeta', addToData('metas'));
  api.registerSyncAPI('addHtmlStyle', addToData('styles'));
  api.registerSyncAPI('addHtmlPrescript', addToData('prescripts'));
  api.registerSyncAPI('addHtmlScript', addToData('scripts'));
  api.registerSyncAPI('addHtmlHeadScript', addToData('headscripts'));
  api.registerSyncAPI('getHtmlData', () => {
    return htmlData;
  });
}
