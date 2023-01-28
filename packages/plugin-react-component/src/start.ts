import path from 'path';
import { createServer } from 'vite';

// import getRollupOptions from './utils/getRollupOptions.js';

import type { IBuildOptions } from './type';

export default async function build(options: IBuildOptions) {
  // const rollupOptions = getRollupOptions(options);

  try {
    const server = await createServer({
      mode: 'development',
      configFile: false,
      root: path.resolve(options.cwd, 'demo'),
      server: {
        port: 3333,
      },
    });

    await server.listen();

    server.printUrls();
  } catch (e) {
    console.error(e);
  }
}

