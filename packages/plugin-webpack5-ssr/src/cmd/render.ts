import { CommandArgs } from '@alicloud/console-toolkit-core'
import { prepareCode } from '../utils';

const render = async (args: CommandArgs) => {
  console.log(args);
  const tmpPath = prepareCode(args)
  const entry = require(tmpPath);
  const module = {exports: {default: (any: any) => {}}}
  entry(module)
  const content = module.exports.default({ location: args.path });
  console.log(content);
}

export default render;