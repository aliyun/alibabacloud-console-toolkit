import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import openBrowser from 'react-dev-utils/openBrowser.js';

const DEFAULT_PORT = parseInt(process.env.PORT || '3000', 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

export default function createServer(config: webpack.Configuration) {
  const compiler = webpack(config);

  const devServerConfig = {
    port: DEFAULT_PORT,
    host: HOST,
  };

  const server = new WebpackDevServer(devServerConfig, compiler);

  ['SIGINT', 'SIGTERM'].forEach((sig) => {
    process.on(sig, () => {
      server.close();
      process.exit();
    });
  });

  // const protocol = https ? 'https' : 'http';
  const url = `http://${devServerConfig.host}:${devServerConfig.port}`;

  openBrowser(url);

  return server;
}
