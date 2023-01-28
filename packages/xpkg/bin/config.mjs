import path from 'path';
import requireModule from '@alicloud/console-toolkit-core/lib/utils/requireModule.js';

const userConfigPath = path.resolve(process.cwd(), 'config/config.ts');

const config = requireModule(userConfigPath);

export default {
  ...config,
  plugins: [...(config.plugins || []), '@alicloud/console-toolkit-plugin-react-component'],
};
