import webpack from 'webpack';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages.js';

export default function build(config: webpack.Configuration) {
  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        if (!err.message) {
          return reject(err);
        }
        console.error(err);
      }

      if (stats) {
        const statsData = stats.toJson({
          all: false,
          warnings: true,
          errors: true,
          timings: true,
          assets: true,
        });

        // @ts-ignore
        const messages = formatWebpackMessages(statsData);

        if (messages.errors.length) {
          console.error('Compiled with errors.');
          console.error(messages.errors.join('\n'));
        } else if (messages.warnings.length) {
          console.warn('Compiled with warnings.');
          console.warn(messages.warnings.join('\n'));
        }
      }

      resolve(stats);
    });
  });
}
