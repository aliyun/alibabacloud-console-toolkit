import { readFile } from 'fs';
import { promisify } from 'util';
import { resolve } from 'path';
const readFileAsync = promisify(readFile);

async function getPackageJson(cwd: string) {
  const path = resolve(cwd, 'package.json');
  return JSON.parse(await readFileAsync(path, 'utf8'));
}

module.exports = async ({ currentConfig, cwd, webpackMerge }: any) => {
  const packageName = (await getPackageJson(cwd)).name;
  return webpackMerge(currentConfig, {
    resolve: {
      alias: {
        [packageName]: resolve(cwd, 'src'),
      },
    },
  });
};
