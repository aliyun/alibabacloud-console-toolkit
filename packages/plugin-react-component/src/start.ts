import { resolve } from 'path';
import { createServer } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import mdPlugin, { Mode } from 'vite-plugin-markdown';

import type { IBuildOptions } from './type';

export default async function build(options: IBuildOptions) {
  const { host = '127.0.0.1', port = 3337 } = options;

  try {
    const server = await createServer({
      mode: 'development',
      configFile: false,
      root: resolve(options.cwd, options.demo || 'demo'),
      plugins: [
        tsconfigPaths({
          root: options.cwd,
        }),
        mdPlugin({
          mode: [Mode.HTML, Mode.TOC, Mode.REACT, Mode.MARKDOWN],
        }),
      ],
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

