#!/usr/bin/env node

import { Service } from '@alicloud/console-toolkit-core';

const service = new Service({ name: '@alicloud/xpkg', version: '1.0.0' });

service.start();
