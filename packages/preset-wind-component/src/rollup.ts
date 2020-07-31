
import { existsSync } from 'fs';
import { resolve } from 'path';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonJs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import autoExternal from 'rollup-plugin-auto-external';
import { exit, error } from '@alicloud/console-toolkit-shared-utils';
import { getBabelOptions } from './babel';
import { IOption } from './type/options';
import { resolveExts } from './utils';

const defaultIgnoreModules = {
  react: 'React',
  'prop-types': 'PropTypes',
  'react-dom': 'ReactDom'
};

function resolveEntry(useTypescript: boolean | undefined) {
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
    externals = [],
    useTypescript,
    sourcemap,
    formats = [],
    rollup
  } = config;
  const extraPlugin = [];

  if (useTypescript) {
    extraPlugin.push(typescript());
  } else {
    extraPlugin.push(babel({
      ...getBabelOptions(config),
      babelHelpers: 'runtime'
    }))
  }
  const presets = {
    input: resolveEntry(useTypescript),
    output: [
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
      nodeResolve(),
      ...extraPlugin,
      commonJs(),
      json(),
      autoExternal(),
    ],
    external: [...Object.keys(defaultIgnoreModules), ...externals, /^@babel\/runtime/]
  };
  return rollup ? rollup(presets) : presets;
}
