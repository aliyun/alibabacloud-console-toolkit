

const requireModule = (path: string) => {
  if (path.endsWith('.ts')) {
    require('@babel/register')({
      only: [path],
      presets: ['@babel/preset-typescript'],
      ignore: [/node_modules/],
      extensions: ['.ts', '.tsx'],
      babelrc: false,
      cache: false,
    });
  }

  const module = require(path) || (() => {});

  return module.__esModule ? module.default : module;
};

export default requireModule;
