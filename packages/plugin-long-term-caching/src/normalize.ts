import { mergeWith, isArray, isPlainObject } from 'lodash';

interface Values {
  // 是否将 module id 进行 hash 处理. 默认开启
  preferHashedModuleId: boolean;

  // 是否将未命名的 chunk id 进行 hash 处理. 默认开启
  preferHashedNamelessChunkId: boolean;

  // 是否开启可供缓存的 html 文件名称, 默认开启
  // 可选值:
  // - false 不使用标识, 本地构建时下强制不使用 html 标识
  // - true (default) 优先使用版本号作为标识, 如果版本号没有获取到, 则使用 contenthash 作为标识
  // - 'version' 只使用版本号作为标识, 如果未检测到版本号则不使用标识
  // - 'hash' 只是用 contenthash 作为标识
  cacheableHtmlFilename: boolean;

  outputFilename: string;

  outputChunkFilename: string;

  extractedCssFilename: string;

  extractedCssChunkFilename: string;

  // 由于 @aliwind/component 组件库在每次发布的时候都可能引入新的组件,
  // 可能无法长效利用缓存资源, 所以排除在公共 vendor 之外
  vendors: string[];

  // 公共依赖模块
  commonChunk: {
    test: string;
    name: string;
    chunks: string;
    minChunks: number;
    enforce: boolean;
    reuseExistingChunk: boolean;
  };
}

const defaultValue = {
  preferHashedModuleId: true,
  preferHashedNamelessChunkId: true,
  cacheableHtmlFilename: true,
  outputFilename: '[name].[contenthash:8].js',
  outputChunkFilename: '[name].[contenthash:8].js',
  extractedCssFilename: '[name].[contenthash:8].css',
  extractedCssChunkFilename: '[name].[contenthash:8].css',
  vendors: [
    'react',
    'react-dom',
    'prop-types',
    'lodash',
    'recompose',
    'reselect',
    'dva',
    'redux',
    'react-redux',
    'redux-saga',
    'react-router',
    'react-router-dom',
    'react-router-redux',
    'history',
    'core-js',
    'moment'
  ],
  commonChunk: {
    test: '',
    name: 'common',
    chunks: 'all',
    minChunks: 5,
    enforce: true,
    reuseExistingChunk: true
  }
};

// 标准化长效缓存的策略参数
export default function(rawValue: boolean | Values): Values | null {
  // 如果传入 true 则直接返回默认的推荐值
  if (rawValue === true) {
    return defaultValue;
  }

  // 如果传入的是一个描述对象, 返回和默认推荐值合并后的描述对象，当配置的属性为数组时，丢弃默认值，使用配置值
  if (isPlainObject(rawValue)) {
    return mergeWith(defaultValue, rawValue, (defaultItem, rawItem) => {
      if (isArray(rawItem)) {
        return rawItem;
      }
    });
  }

  // 其他情况直接返回 null
  return null;
}
