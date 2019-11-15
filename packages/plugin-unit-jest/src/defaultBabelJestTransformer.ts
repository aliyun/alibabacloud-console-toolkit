import { resolve } from 'path';

const babelJest = require('babel-jest');

const getConfig = () => {
  let babelConfig,
    loadConfigFail = false;
  try {
    babelConfig = require(resolve(__dirname, 'babel.config.js'));
  } catch (error) {
    loadConfigFail = true;
  }
  if (typeof babelConfig !== 'object') {
    loadConfigFail = true;
  }
  if (loadConfigFail) {
    throw new Error(
      'breezr-plugin-unit-jest: cannot find babel config for babel-jest. please provide "babelOptions" if you provide "babelJestTransformPatterns"'
    );
  }
  return babelConfig;
};

module.exports = babelJest.createTransformer({
  ...getConfig(),
});
