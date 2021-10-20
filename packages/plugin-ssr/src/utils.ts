import * as fs from 'fs';
import * as path from 'path';
import { CommandArgs } from '@alicloud/console-toolkit-core'

export const prepareCode = (args: CommandArgs) => {
  let config = {};
  if (args.config) {
    config = require(args.consoleConfig);
  }
  const code = fs.readFileSync(args._[1], 'UTF-8');
  const tmpPath = path.join(process.cwd(), `node_modules/${Date.now().toString()}.js`);
  fs.writeFileSync(tmpPath, `
const renderFunction = function (module) {
  var window = {}; var navigator = {}; ${args.enableConsole ? '' : 'var console = { assert: () => {},clear: () => {},context: () => {},count: () => {},countReset: () => {},debug: () => {},dir: () => {},dirxml: () => {},error: () => {},group: () => {},groupCollapsed: () => {},groupEnd: () => {},info: () => {},log: () => {}, memory: () => {},profile: () => {},profileEnd: () => {},table: () => {},time: () => {},timeEnd: () => {},timeLog: () => {},timeStamp: () => {},trace: () => {},warn: () => {}, }'}
  window.ALIYUN_CONSOLE_CONFIG = ${JSON.stringify(config)}
  var location = window.location = {
  search: '',
  hostname: 'foo.bar.com',
  hash: '',
  }; 
  const setTimeout = () => {};
  window.setTimeout = () => {};
\n${code}
\n module.exports.updateWindow = (w) => window = w\n}; module.exports = renderFunction`);
  return tmpPath;
}