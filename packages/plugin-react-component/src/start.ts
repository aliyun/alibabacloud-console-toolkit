import path from 'path';
import { createServer } from 'vite';

import type { IBuildOptions } from './type';

export default async function build(options: IBuildOptions) {
  const { host = '127.0.0.1', port = 3337 } = options;

  try {
    const server = await createServer({
      mode: 'development',
      configFile: false,
      root: path.resolve(options.cwd, options.demo || 'demo'),
      server: {
        host,
        port,
      },
    });

    await server.listen();

    server.printUrls();
  } catch (e) {
    console.error(e);
  }
}

