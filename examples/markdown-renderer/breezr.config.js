/**
 * 默认配置文件，一般来说你不需要更改此文件，
 * 如果需要构建相关，请参考下面链接的 自定义构建选项
 *    https://wind.alibaba-inc.com/docs/quickstart/quick-start
 */

const config = {
  // 请自己加入 wepback-merge 自定义
  // webpack: (config) => (webpack-merge(config, {}))
  useTypescript: true
};

module.exports = {
  presets: [["@alicloud/console-toolkit-preset-official", config]]
};
