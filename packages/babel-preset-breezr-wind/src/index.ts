import { resolve } from 'path';

const defaultWindIntlOptions = {
  source: '@aliwind/wind-intl',
  importName: 'default',
  outputFilePath: 'locales/messages.js',
};

export default ((ctx: any, options: any) => {
  const env = process.env.NODE_ENV;
  // api.assertVersion(7);
  const {
    context = resolve(process.cwd(), 'src'),
    // Support IE 10
    reactHotLoader = false,
    reactCssModules = false,
    windRc = true,
    windCherryPick = true,
    windLoadableCodeSplitting = true,
  } = options;

  const plugins = [];

  if (reactCssModules) {
    const reactCssModulesOptions = {
      context,
      filetypes: {
        '.less': {
          syntax: require.resolve('postcss-less'),
        },
      },
      exclude: 'node_modules',
      handleMissingStyleName: 'warn',
      webpackHotModuleReloading: true,
    };

    plugins.push(
      [
        require.resolve('babel-plugin-react-css-modules'),
        reactCssModulesOptions,
      ]
    );
  }

  if (windCherryPick) {
    plugins.push(require.resolve('babel-plugin-wind'));
    plugins.push(
      require.resolve('babel-plugin-lodash')
    );
  }

  if (windRc) {
    plugins.push([
      require.resolve('babel-plugin-wind-rc'),
      {
        ...(typeof windRc === 'boolean' ? {} : windRc),
      },
    ]);
  }

  if (windLoadableCodeSplitting) {
    plugins.push(
      require.resolve('babel-plugin-transform-loadable-component')
    );
  }

  if (reactHotLoader && env !== 'production') {
    plugins.unshift(require.resolve('react-hot-loader/babel'));
  }

  return {
    plugins,
    presets: [
      [require.resolve('babel-preset-breezr')],
    ],
  };
});
