import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';
import autoprefixer from 'autoprefixer';
import { fileURLToPath } from 'url';
import { RollupOptions } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';
import styles from 'rollup-plugin-styles';

import type { IBuildOptions } from '../type';

export default function getRollupOptions(options: IBuildOptions) {
  const { cwd, sourcemap = false, babelPlugins = [], src = 'src' } = options;
  const rootDir = path.resolve(cwd, src);
  const dest = path.resolve(cwd, './esm');

  const pkg = fs.readJSONSync(path.resolve(cwd, 'package.json'));

  let useTypescript = false;

  const input = Object.fromEntries(
    glob.sync(path.join(rootDir, '/**/*[!.d].{ts,tsx,js,jsx}')).map((file) => {
      const ext = path.extname(file);
      if (ext === '.ts' || ext === '.tsx') useTypescript = true;

      return [
        path.relative(rootDir, file.slice(0, file.length - ext.length)),
        fileURLToPath(new URL(file, import.meta.url)),
      ];
    }),
  );

  const peerDeps = Object.keys(pkg.peerDependencies || {});
  const deps = Object.keys(pkg.dependencies || {});

  const _options: RollupOptions = {
    input,
    output: {
      format: 'es',
      dir: dest,
      sourcemap,
      assetFileNames: '[name][extname]',
    },
    external: [
      /@babel\/runtime/,
      'react',
      'react-dom',
      'react/jsx-runtime',
      'core-js',
      'regenerator-runtime',
      'tslib',
    ].concat(peerDeps).concat(deps),
    plugins: [
      styles({
        plugins: [autoprefixer()],
        autoModules: true,
        mode: 'extract',
        minimize: false,
        sourceMap: false,
      }),
      commonjs({
        include: /\/node_modules\//,
        esmExternals: false,
        requireReturnsDefault: 'namespace',
      }),
      nodeResolve({
        extensions: ['.mjs', '.js', '.jsx', '.json', '.node', '.ts', '.jsx', '.tsx', '.cjs', '.mts', '.cts'],
      }),
      json(),
      useTypescript && typescript({
        cwd,
        useTsconfigDeclarationDir: true,
        tsconfigDefaults: {
          compilerOptions: {
            target: 'es5',
            declaration: true,
            allowJs: true,
            jsx: 'react',
            declarationDir: dest,
          },
          include: [rootDir],
        },
        tsconfig: path.resolve(cwd, 'tsconfig.json'),
        tsconfigOverride: {
          compilerOptions: {
            module: 'ESNext',
          },
        },
      }),
      babel({
        babelHelpers: 'runtime',
        babelrc: false,
        configFile: false,
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.es6', '.es', '.mjs'],
        presets: ['@babel/preset-env', '@babel/preset-react'],
        plugins: ['@babel/plugin-transform-runtime', ...babelPlugins],
      }),
    ],
  };

  return _options;
}

