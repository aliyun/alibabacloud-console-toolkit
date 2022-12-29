import path from 'path';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { IContext, BuildType } from '@alicloud/console-toolkit-core';

import requireResolve from '../utils/requireResolve.js';
import generateCdnPath from '../utils/generateCdnPath.js';
import HtmlInjectPlugin from '../plugins/htmlInjectPlugin.js';
import { TMP_DIR } from '../constant.js';
import type { IConfig } from '../type';

const terserOptions: TerserPlugin.TerserOptions = {
  compress: {
    ecma: 5,
    unused: true,
    // The following two options are known to break valid JavaScript code
    // https://github.com/vercel/next.js/issues/7178#issuecomment-493048965
    comparisons: false,
    inline: 2,
  },
  mangle: {
    safari10: true,
  },
  format: {
    safari10: true,
    comments: false,
    // Fixes usage of Emoji and certain Regex
    ascii_only: true,
  },
};

const getStyleLoaders = (isDev: boolean, loader?: string, loaderOptions?: any, modules?: boolean) => {
  const loaders: any[] = [
    isDev && requireResolve('style-loader'),
    !isDev && {
      loader: MiniCssExtractPlugin.loader,
      options: {
        publicPath: 'auto',
        esModule: false,
      },
    },
    {
      loader: requireResolve('css-loader'),
      options: {
        importLoaders: loader ? 2 : 1,
        sourceMap: false,
        modules: modules ? {
          localIdentName: `${'' ? '' : '[path]'}___[name]__[local]___[hash:base64:5]`,
        } : {},
      },
    },
    {
      // Options for PostCSS as we reference these options twice
      // Adds vendor prefixing based on your specified browser support in
      // package.json
      loader: requireResolve('postcss-loader'),
      options: {
        postcssOptions: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: 'postcss',
          config: false,
          // plugins: !useTailwind
          //   ? [
          //       'postcss-flexbugs-fixes',
          //       [
          //         'postcss-preset-env',
          //         {
          //           autoprefixer: {
          //             flexbox: 'no-2009',
          //           },
          //           stage: 3,
          //         },
          //       ],
          //       // Adds PostCSS Normalize as the reset css with default options,
          //       // so that it honors browserslist config in package.json
          //       // which in turn let's users customize the target behavior as per their needs.
          //       'postcss-normalize',
          //     ]
          //   : [
          //       'tailwindcss',
          //       'postcss-flexbugs-fixes',
          //       [
          //         'postcss-preset-env',
          //         {
          //           autoprefixer: {
          //             flexbox: 'no-2009',
          //           },
          //           stage: 3,
          //         },
          //       ],
          //     ],
        },
      },
    },
  ].filter(Boolean);

  if (loader) {
    loaders.push({
      loader: requireResolve(loader),
      options: loaderOptions || {},
    });
  }

  return loaders;
};

const getCommonConfig = (context: IContext, config: IConfig) => {
  const {
    mode,
    alias,
    externals,
    swc,
    devServer,
    analyzer,
    useTypeScript,
    entry,
  } = config;

  const { buildType, buildDestDir, isDev } = context.env;

  const output = {
    filename: '[name].js',
    path: path.join(context.cwd, 'build'),
    publicPath: '/',
    chunkFilename: '[name].js',
  };

  if ((buildType === BuildType.Dev_Cloud || buildType === BuildType.Prod_Cloud) && buildDestDir) {
    output.path = path.join(context.cwd, buildDestDir);
  }

  const webpackConfig: webpack.Configuration = {
    mode,
    entry: {
      index: entry || `./${TMP_DIR}/index`,
    },
    externals,
    output,
    infrastructureLogging: {
      level: 'warn',
    },
    stats: 'none',
    performance: false,
    // cache: enableCache ? {
    //   type: 'filesystem',
    //   version: `${context.version}|${userConfigHash}`,
    //   buildDependencies: { config: [path.join(rootDir, 'package.json')] },
    //   cacheDirectory: path.join(cacheDir, 'webpack'),
    // } : false,
    module: {
      parser: {
        javascript: {
          importExportsPresence: 'warn',
          exportsPresence: 'warn',
        },
      },
      rules: [
        {
          oneOf: [
            {
              test: [/\.avif$/],
              type: 'asset',
              mimetype: 'image/avif',
              parser: {
                dataUrlCondition: {
                  maxSize: 10000,
                },
              },
            },
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              type: 'asset',
              parser: {
                dataUrlCondition: {
                  maxSize: 10000,
                },
              },
            },
            // {
            //   test: /\.svg$/,
            //   use: [
            //     {
            //       loader: requireResolve('@svgr/webpack'),
            //       options: {
            //         prettier: false,
            //         svgo: false,
            //         svgoConfig: {
            //           plugins: [{ removeViewBox: false }],
            //         },
            //         titleProp: true,
            //         ref: true,
            //       },
            //     },
            //     {
            //       loader: requireResolve('file-loader'),
            //       options: {
            //         name: 'static/media/[name].[hash].[ext]',
            //       },
            //     },
            //   ],
            //   issuer: {
            //     and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
            //   },
            // },
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              loader: requireResolve('babel-loader'),
              options: {
                presets: [
                  [
                    requireResolve('babel-preset-breezr-wind'),
                    {
                      reactRefresh: isDev(),
                    },
                  ],
                ],
                babelrc: false,
                configFile: false,
                // @remove-on-eject-end
                compact: context.env.isProd(),
              },
            },
            {
              test: /\.css$/,
              exclude: /\.module\.css$/,
              use: getStyleLoaders(isDev()),
            },
            {
              test: /\.module\.css$/,
              use: getStyleLoaders(isDev(), undefined, undefined, true),
            },
            {
              test: /\.less$/,
              exclude: /\.(scoped?|module)\.less$/,
              use: getStyleLoaders(isDev(), 'less-loader', {
                lessOptions: { javascriptEnabled: true },
              }),
            },
            {
              test: /\.(scoped?|module)\.less$/,
              use: getStyleLoaders(isDev(), 'less-loader', {
                lessOptions: { javascriptEnabled: true },
              }, true),
            },
            {
              test: /\.(scss|sass)$/,
              exclude: /\.module\.(scss|sass)$/,
              use: getStyleLoaders(isDev(), 'sass-loader'),
            },
            {
              test: /\.module\.(scss|sass)$/,
              use: getStyleLoaders(isDev(), 'sass-loader'),
            },
            {
              exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              type: 'asset/resource',
            },
          ],
        },
      ],
    },
    resolve: {
      alias,
      symlinks: true,
      extensions: ['.ts', '.tsx', '.jsx', '...'],
      mainFields: ['browser', 'module', 'jsnext:main', 'main'],
      fallback: {
        // TODO: add more fallback module
        events: requireResolve('events'),
        stream: false,
        fs: false,
        path: false,
      },
    },
    // watchOptions: {
    //   // add a delay before rebuilding once routes changed
    //   // webpack can not found routes component after it is been deleted
    //   aggregateTimeout: 200,
    //   ignored: watchIgnoredRegexp,
    // },
    optimization: {
      splitChunks: { minChunks: Infinity, cacheGroups: { default: false } },
      minimize: true,
      minimizer: [
        new TerserPlugin({
          // Minify of swc is still experimental, config `minify: 'swc'` faster minification.
          minify: swc ? TerserPlugin.swcMinify : TerserPlugin.terserMinify,
          extractComments: false,
          terserOptions,
        }),
        new CssMinimizerPlugin({
          parallel: false,
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
              },
            ],
          },
        }),
      ],
    },
    // @ts-ignore
    plugins: [
      new HtmlWebpackPlugin(
        Object.assign(
          {
            inject: true,
            minify: { // 压缩HTML文件
              removeComments: true, // 移除HTML中的注释
            },
            filename: 'index.html',
            template: path.resolve(context.cwd, 'src/index.html'),
            templateParameters: {
              __dev__: isDev(),
            },
          },
        ),
      ),
      new HtmlInjectPlugin({
        data: {},
        htmlXmlMode: false,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/(?!(zh|en|jp)).*/,
        contextRegExp: /moment\/locale/,
      }),
      new webpack.DefinePlugin({
        'process.env.PROJECT_PUBLIC_PATH': JSON.stringify(generateCdnPath(context.env)),
        'process.env.NODE_ENV': JSON.stringify(context.env.nodeEnv),
        'process.env.REACT_APP_SC_ATTR': JSON.stringify(''),
        'process.env.SC_ATTR': JSON.stringify(''),
      }),
      new webpack.ProvidePlugin({
        process: requireResolve('process/browser'),
      }),
      analyzer && new BundleAnalyzerPlugin(),
      useTypeScript && new ForkTsCheckerWebpackPlugin({
        typescript: {
          memoryLimit: 4089,
          configFile: path.resolve(context.cwd, 'tsconfig.json'),
        },
      }),
    ].filter(Boolean),
    devServer,
  };

  return webpackConfig;
};

export default getCommonConfig;
