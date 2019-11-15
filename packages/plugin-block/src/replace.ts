import { toLower, camelCase, upperCase } from 'lodash';

function stripFirstSlash(path: string) {
  if (path.charAt(0) === '/') {
    return path.slice(1);
  }
  return path;
}

function getConstVarsFromPath(path: string) {
  let ROUTE_PATH = path;
  if (path.includes('-') || path.includes('_')) {
    ROUTE_PATH = toLower(path);
  }
  const PAGE_NAME = ROUTE_PATH.split('/').pop();
  const BLOCK_NAME = stripFirstSlash(ROUTE_PATH).replace(/\//g, '-');

  return new Map([
    ['ROUTE_PATH', toLower(ROUTE_PATH)],
    // [XXX][_UPPER]_CAMEL_CASE 需要在 XXX 之前，
    // 因为先替换 XXX 会修改 [XXX][_UPPER]_CAMEL_CASE 里的 XXX
    ['BLOCK_NAME_CAMEL_CASE', camelCase(BLOCK_NAME)],
    ['BLOCK_NAME', toLower(BLOCK_NAME)],
    ['PAGE_NAME_UPPER_CAMEL_CASE', upperCase(camelCase(PAGE_NAME))],
    ['PAGE_NAME', toLower(PAGE_NAME)],
  ]);
}


export default function(content: string, { path }: { path: string }) {
  const vars = getConstVarsFromPath(path);
  const replaceReg = new RegExp(Array.from(vars.keys()).join('|'), 'g');
  return content.replace(replaceReg, match => {
    const result = vars.get(match);
    if (result) {
      return result;
    }
    return match;
  });
}
