import { existsSync } from 'fs';
import { resolve } from 'path';
import * as babel from 'rollup-plugin-babel';
import * as commonJs from 'rollup-plugin-commonjs';
import * as nodeResolve from 'rollup-plugin-node-resolve';
import * as json from 'rollup-plugin-json';
import * as less from 'rollup-plugin-less';
import { getBabelOptions } from './babel';
import { resolveExts } from './utils';
import { exit, error } from '@alicloud/console-toolkit-shared-utils';

const defaultIgnoreModules = {
  react: 'React',
  'prop-types': 'PropTypes',
  'react-dom': 'ReactDom'
};

function resolveEntry(useTypescript: boolean | undefined) {
  if (useTypescript) {
    return resolve(process.cwd(), `lib/index.js`);
  }
  const exts = resolveExts(useTypescript);
  const filePath = exts
    .map(ext => resolve(process.cwd(), `src/index${ext}`))
    .find(p => existsSync(p));
  if (!filePath) {
    error('please use index.js, index.jsx as entry');
    exit(1);
  }
  return filePath;
}

export function getRollupConfig(config: IOption) {
  const {
    moduleName,
    globals,
    external,
    useTypescript,
    sourcemap,
    formats = [],
    rollup
  } = config;
  const extraPlugin = [require('rollup-plugin-node-builtins')()];
  if (useTypescript) {
    extraPlugin.push(require('rollup-plugin-typescript')());
  }
  const presets = {
    input: resolveEntry(useTypescript),
    output: [
      {
        format: 'umd',
        file: 'dist/index.umd.js',
        name: moduleName,
        globals: {
          ...defaultIgnoreModules,
          ...globals
        },
        sourcemap
      },
      {
        format: 'cjs',
        file: 'dist/index.cjs.js',
        sourcemap
      },
      {
        format: 'esm',
        file: 'dist/index.esm.js',
        sourcemap
      },
      ...formats
    ],
    plugins: [
      nodeResolve({
        jsnext: true,
        main: true
      }),
      babel({
        ...getBabelOptions(config, {
          useInternalRuntime: true
        }),
        runtimeHelpers: true
      }),
      ...extraPlugin,
      commonJs(),
      json(),
      less({
        output: './dist/index.css'
      })
    ],
    external: [...Object.keys(defaultIgnoreModules), ...external]
  };
  return rollup ? rollup(presets) : presets;
}
