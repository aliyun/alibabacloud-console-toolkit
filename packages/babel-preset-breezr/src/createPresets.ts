import { IOptions, BabelPresets } from './types';
import { isDevelopment } from './utils';

export default (options: IOptions): BabelPresets => [
  [
    require('@babel/preset-env').default,
    {
      // Works with IE 9
      targets: {
        ie: 9,
        safari: 'tp',
      },

      // To avoid user to override browsers supports with custom configuration
      // which includes searching for any browserslist files
      // or referencing the browserslist key inside package.json
      ignoreBrowserslistConfig: true,

      // Don't add polyfills automatically per file.
      // Polyfills should be applied on an `App` rather than a `Library`
      // https://babeljs.io/docs/en/babel-preset-env#usebuiltins
      useBuiltIns: false,

      // Do not transform modules but using ES6 module
      modules: options.module || false,
    },
  ],
  [
    require('@babel/preset-react').default,
    {
      development: isDevelopment(options.env),
    },
  ],
];
