#!/usr/bin/env node

// import path from 'path';
import { Service } from '@alicloud/console-toolkit-core';

import d from 'plugin-react';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const service = new Service({ name: 'cli-demo', version: '1.0.0' });

service.start();
