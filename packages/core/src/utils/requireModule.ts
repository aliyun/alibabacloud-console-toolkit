import fs from 'fs-extra';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve as pathResolve, join as pathJoin } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const require = createRequire(import.meta.url);

export const loadPkg = (path: string, cwd: string) => {
  /**
   * esModule 设置 exports 时可能会无法直接解析 package.json
   */
  const absolutePath = require.resolve(path, { paths: [cwd] });
  let relativePath = absolutePath;
  let pkgJSONPath = pathJoin(relativePath, 'package.json');

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

  let absolutePath = path;
  let isTypeModule = false;

  if (isPkg) {
    try {
      absolutePath = require.resolve(path);
    } catch (e) {
      absolutePath = require.resolve(path, { paths: [cwd] });
    }

    const pkgJSON = loadPkg(path, cwd);
    isTypeModule = pkgJSON.type === 'module';
  }

  const isTs = ['.ts', '.mts'].some((type) => absolutePath.endsWith(type));
  const isESM = ['.mjs'].some((type) => absolutePath.endsWith(type));

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
    module = await import(absolutePath);
    return module.default || module;
  }

  module = require(absolutePath);
  return module.__esModule ? module.default : module;
};

export default requireModule;
