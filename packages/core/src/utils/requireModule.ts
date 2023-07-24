import fs from 'fs-extra';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve as pathResolve, join as pathJoin } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const require = createRequire(import.meta.url);

const requireResolve = (path: string, cwd: string) => {
  try {
    return require.resolve(path);
  } catch (e) {
    return require.resolve(path, { paths: [cwd] });
  }
};

/**
 * 解析 package 入口文件
 * @param path string
 * @param cwd string
 * @returns string
 */
export const resolvePkgEntry = (path: string, cwd: string) => {
  return requireResolve(path, cwd);
};

/**
 * 解析 package.json
 * @param path string
 * @param cwd string
 * @returns string
 */
export const loadPkgJSON = (path: string, cwd: string) => {
  // throw error when find package.json failed
  let relativePath = dirname(requireResolve(path, cwd));
  let pkgJSONPath = pathJoin(relativePath, './package.json');

  while (!fs.existsSync(pkgJSONPath) && relativePath !== cwd && relativePath !== '/') {
    relativePath = pathJoin(relativePath, '..');
    pkgJSONPath = pathJoin(relativePath, 'package.json');
  }

  return fs.readJSONSync(pkgJSONPath);
};

const requireModule = async (path: string | undefined, cwd: string) => {
  if (!path) {
    return () => {};
  }

  const isBuiltIn = path.includes(pathResolve(__dirname, '../builtin/'));
  const isPkg = !['.', '/'].some((str) => path.startsWith(str));

  let entryPath = path;
  let isTypeModule = false;

  if (isPkg) {
    entryPath = resolvePkgEntry(path, cwd);

    const pkgJSON = loadPkgJSON(path, cwd);
    isTypeModule = pkgJSON.type === 'module';
  }

  const isTs = ['.ts', '.mts'].some((type) => entryPath.endsWith(type));
  const isESM = ['.mjs'].some((type) => entryPath.endsWith(type));

  if (isTs) {
    require(require.resolve('@babel/register'))({
      presets: [require.resolve('@babel/preset-env'), require.resolve('@babel/preset-typescript')],
      ignore: [/node_modules/],
      extensions: ['.ts', '.tsx'],
      babelrc: false,
      cache: false,
    });
  }

  let module;

  if ((isESM || isTypeModule || isBuiltIn) && !isTs) {
    module = await import(entryPath);
    return module.default || module;
  }

  module = require(entryPath);
  return module.__esModule ? module.default : module;
};

export default requireModule;
