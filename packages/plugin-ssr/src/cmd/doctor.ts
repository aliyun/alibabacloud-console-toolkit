import { CommandArgs } from '@alicloud/console-toolkit-core';
import { info, done, error } from '@alicloud/console-toolkit-shared-utils'
import { memoryUsage } from 'process'

import { prepareCode } from '../utils';

const doctor = async (args: CommandArgs) => {
  const tmpPath = prepareCode(args)
  const entry = require(tmpPath);

  const module = {exports: {default: (any: any) => {}}}
  entry(module)
  module.exports.default({ location: args.path });
  info(`准备开始对 ${args._[1]} 做渲染检查`);
  const memoryUsageBefore = memoryUsage();
  info(`初始堆栈数据 rss: ${memoryUsageBefore.rss}, heapTotal: ${memoryUsageBefore.heapTotal}, heapUsed: ${memoryUsageBefore.heapUsed}`);

  for(let index = 1; index < (args.renderNumber ? +args.renderNumber : 1000); index++) {
    const module = {exports: {default: (any: any) => {}}}
    entry(module)
    module.exports.default({ location: args.path });
    if (index % 100 == 0) {
      console.log(`进度 ${index*100/1000}%`)
      global.gc();
    }
  }

  const memoryUsageAfter = memoryUsage();

  done(`最终数据 rss: ${memoryUsageBefore.rss}, heapTotal: ${memoryUsageAfter.heapTotal}, heapUsed: ${memoryUsageAfter.heapUsed}`);

  global.gc();

  if ((memoryUsageAfter.heapUsed - memoryUsageBefore.heapUsed) / memoryUsageBefore.heapUsed > 0.1) {
    error(`发现内存溢出 你可以通过添加 --heapdump 参数生成 内存快照 排查内存`)
    console.log(`\n\t tnpm i heapdump`)
    console.log(`\n\t ${process.argv.join(' ')} --heapdump`)
  }
  if (args.heapdump) {
    const heapdump = require('heapdump')
    heapdump.writeSnapshot();
  }
}

export default doctor;