import { IOptionalOptions } from 'babel-preset-breezr/lib/types';

export function getBabelOptions(
  config: IOption,
  presetOptions?: IOptionalOptions
) {
  const plugins = [];

  if (!config.disableStyleRemove) {
    plugins.push([
      require.resolve('babel-plugin-transform-remove-imports'),
      {
        test: '(scss|sass|less|css|stylus)$',
      },
    ]);
  }

  if (config.babelModuleResolve) {
    // https://github.com/tleunen/babel-plugin-module-resolver/blob/master/DOCS.md
    plugins.push(['module-resolver', config.babelModuleResolve]);
  }

  if (config.useTypescript) {
    // TODO: --importHelpers
    //
    plugins.push([
      require.resolve('@babel/plugin-transform-typescript'),
      {
        // @ts-ignore
        isTSX: true,
      },
    ]);
  }
  return {
    presets: [
      [
        require.resolve('babel-preset-breezr'),
        {
          ...presetOptions,
        },
      ],
    ],
    plugins,
  };
}
