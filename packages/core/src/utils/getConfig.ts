import fs from 'fs';

import type { IConfig } from '../types/config';
import requireModule from './requireModule.js';

const defaultConfig: IConfig = {
  presets: [],
  plugins: [],
};

const checkConfig = (config: IConfig) => {
  if (!config.presets) config.presets = [];
  if (!config.plugins) config.plugins = [];

  return config;
};

const getUserConfig = async (filePaths: (string | undefined)[], cwd: string) => {
  const filePath = filePaths.find((path) => path && fs.existsSync(path));

  if (!filePath) {
    console.error(`cannot find config: ${filePaths.join(',')}`);
  }

  try {
    return checkConfig(await requireModule(filePath, cwd));
  } catch (e) {
    console.error(e);
    return defaultConfig;
  }
};

export default getUserConfig;
