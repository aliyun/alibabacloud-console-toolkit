#!/usr/bin/env node

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Service } from '@alicloud/console-toolkit-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const service = new Service({ name: '@alicloud/xpkg', version: '1.0.0' });

service.start({
  configFile: path.resolve(__dirname, './config.mjs'),
});
