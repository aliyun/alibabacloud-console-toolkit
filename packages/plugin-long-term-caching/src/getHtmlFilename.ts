export default function(type: boolean | string, version: string) {
  const rawFilename = 'index.html';
  const versionalizedFilename = `index.${version}.html`;

  // 使用 8 位 content hash 来作为 html 的唯一标识
  //
  // TODO(xingda.xd):
  // 这个 feature 在这段程序写完之时暂时还不可用
  // 需要等待 html-webpack-plugin 的相关 PR 合并并发布新版本之后才能正常使用
  //
  // ref issues:
  // - https://github.com/jantimon/html-webpack-plugin/issues/556
  //
  // ref pull requests:
  // - https://github.com/jantimon/html-webpack-plugin/pull/1021
  //
  const hashedFilename = 'index.[contenthash:8].html';

  if (type === true) {
    return version ? versionalizedFilename : hashedFilename;
  }

  if (type === 'version') {
    return version ? versionalizedFilename : rawFilename;
  }

  if (type === 'hash') {
    return hashedFilename;
  }

  return rawFilename;
}
