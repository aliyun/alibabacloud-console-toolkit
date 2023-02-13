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
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';

import type { IBuildOptions } from '../type';

export default function getRollupOptions(options: IBuildOptions) {
  const { cwd, sourcemap = false } = options;
  const rootDir = path.resolve(cwd, 'src');
  const dest = path.resolve(cwd, './esm');

  const pkg = fs.readJSONSync(path.resolve(cwd, 'package.json'));

  const input = Object.fromEntries(
    glob.sync(path.join(rootDir, '/**/*[!.d].{ts,tsx,js,jsx}')).map((file) => [
      path.relative(rootDir, file.slice(0, file.length - path.extname(file).length)),
      fileURLToPath(new URL(file, import.meta.url)),
    ]),
  );

  const peerDeps = Object.keys(pkg.peerDependencies || {});
  const deps = Object.keys(pkg.dependencies || {});

  const _options: RollupOptions = {
    input,
    output: {
      format: 'es',
      dir: dest,
      sourcemap,
    },
    external: ['react', 'react-dom'].concat(peerDeps).concat(deps),
    plugins: [
      postcss({
        plugins: [autoprefixer()],
        autoModules: true,
        // only write out CSS for the first bundle (avoids pointless extra files):
        inject: false,
        extract: true,
        minimize: true,
      }),
      commonjs({
        extensions: [
          '.js',
        ],
      }),
      nodeResolve({
        extensions: ['.mjs', '.js', '.jsx', '.json', '.node', '.ts', '.jsx', '.tsx', '.cjs', '.mts', '.cts'],
      }),
      json(),
      typescript({
        cwd,
        useTsconfigDeclarationDir: true,
        tsconfigDefaults: {
          compilerOptions: {
            target: 'es5',
            declaration: true,
            allowJs: true,
            jsx: 'preserve',
            declarationDir: dest,
          },
        },
        tsconfig: path.resolve(cwd, 'tsconfig.json'),
        tsconfigOverride: {
          compilerOptions: {
            module: 'ESNext',
          },
        },
      }),
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        configFile: false,
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.es6', '.es', '.mjs'],
      }),
    ],
  };

  return _options;
}

