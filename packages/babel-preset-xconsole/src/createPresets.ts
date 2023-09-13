import { IOptions, BabelPresets } from './types';
import { isDevelopment } from './utils';

export default (options: IOptions) => [
  [
    require('@babel/preset-env').default,
    {
      bugfixes: true,

      corejs: '3.32.2',

      // To avoid user to override browsers supports with custom configuration
      // which includes searching for any browserslist files
      // or referencing the browserslist key inside package.json
      ignoreBrowserslistConfig: true,

      // migrating to the top level assumptions
      loose: false,

      // Do not transform modules but using ES6 module
      modules: false,

      spec: false,

      // Works with IE 9
      targets: {
        ie: 9,
        safari: 'tp',
      },

      // Don't add polyfills automatically per file.
      // Polyfills should be applied on an `App` rather than a `Library`
      // https://babeljs.io/docs/en/babel-preset-env#usebuiltins
      useBuiltIns: 'entry',
    },
  ],
  [
    require('@babel/preset-react').default,
    {
      development: isDevelopment(options.env),
    },
  ],
  options.typescript && [
    require('@babel/preset-typescript').default,
    {
      allowNamespaces: true,
      allowDeclareFields: true,
      optimizeConstEnums: true,
    },
  ],
].filter(Boolean) as BabelPresets;
