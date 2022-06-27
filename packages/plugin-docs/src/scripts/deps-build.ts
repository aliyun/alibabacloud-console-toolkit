import { Service } from '@alicloud/console-toolkit-core';
import { config } from './configs/deps';

(async () => {
  console.log('开始构建微应用external依赖...');
  const service = new Service({
    cwd: process.cwd(),
    config: config({ isDev: false }),
  });
  await service.run('build');
  console.log('成功构建微应用external依赖');
})();
