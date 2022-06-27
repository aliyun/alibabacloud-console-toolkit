import { Service } from '@alicloud/console-toolkit-core';
import getPort from 'get-port';

import { config } from './configs/deps';

getPort().then((port) => {
  console.log('开始serve微应用external依赖...');
  const service = new Service({
    cwd: process.cwd(),
    config: config({ port }),
  });
  service.run('start');
  service.on('onServerRunning', () => {
    console.log('serve构建微应用external依赖成功');
    if (process.send) {
      process.send({
        type: 'server_started',
        port: port,
      });
    }
  });
});

// import { Service } from '@alicloud/console-toolkit-core';
// import * as getPort from 'get-port';

// import { config } from './configs/deps';

// async function depsServe() {
//   const port = await getPort();
//   console.log('开始serve微应用external依赖...');

//   const service = new Service({
//     cwd: process.cwd(),
//     config: config({ port }),
//   });
//   service.run('start');

//   service.on('onServerRunning', () => {
//     console.log('serve构建微应用external依赖成功');
//     if (process.send) {
//       process.send({
//         type: 'server_started',
//         port: port,
//       });
//     }
//   });
// }

// depsServe();
