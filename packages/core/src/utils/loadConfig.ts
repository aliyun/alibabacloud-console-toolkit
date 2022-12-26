import fs from 'fs';

import { IConfig } from '../types/config';
import requireModule from './requireModule';

const defaultConfig: IConfig = {
  presets: [],
  plugins: [],
};

const checkConfig = (config: IConfig) => {
  if (!config.presets) config.presets = [];
  if (!config.plugins) config.plugins = [];

  return config;
};

const getUserConfig = (filePaths: string[]) => {
  const filePath = filePaths.find((path) => fs.existsSync(path));

  if (!filePath) {
    console.error('cannot find config.');
  }

  try {
    return checkConfig(requireModule(filePath));
  } catch (e) {
    console.error(e);
    return defaultConfig;
  }
};

export default getUserConfig;
