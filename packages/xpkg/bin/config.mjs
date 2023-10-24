import path from 'path';
import fs from 'fs';
import requireModule from '@alicloud/console-toolkit-core/utils/requireModule.js';

const cwd = process.cwd();
const userConfigPath = path.resolve(cwd, 'config/config.ts');
let userConfig = {};

if (!fs.existsSync(userConfigPath)) {
  console.log(`cannot find config/config.ts in ${cwd}.`);
} else {
  userConfig = await requireModule(userConfigPath);
}

export default {
  ...userConfig,
  plugins: [
    ...(userConfig.plugins || []),
    ['@alicloud/console-toolkit-plugin-react-component',
      {
        ...userConfig,
      },
    ]],
};
