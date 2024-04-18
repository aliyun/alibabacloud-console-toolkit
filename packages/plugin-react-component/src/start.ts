import { resolve } from 'path';
import { createServer, PluginOption } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import mdPlugin, { Mode } from 'vite-plugin-markdown';
import mkcert from 'vite-plugin-mkcert';

import type { IBuildOptions } from './type';

export default async function start(options: IBuildOptions) {
  const { host = '127.0.0.1', port = 3337, https = false } = options;

  const plugins: PluginOption[] = [
    tsconfigPaths({
      root: options.cwd,
    }),
    mdPlugin({
      mode: [Mode.HTML, Mode.TOC, Mode.REACT, Mode.MARKDOWN],
    }),
  ];

  if (https) {
    plugins.push(mkcert({
      hosts: [host],
    }));
  }

  const server = await createServer({
    mode: 'development',
    configFile: false,
    root: resolve(options.cwd, options.demo || 'demo'),
    plugins,
    server: {
      host,
      port,
      https,
    },
  });

  await server.listen();

  server.printUrls();
}

