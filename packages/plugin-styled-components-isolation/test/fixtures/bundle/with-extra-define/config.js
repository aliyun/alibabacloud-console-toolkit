const webpack = require('webpack');

module.exports = (chain) => {
  chain.plugin('NodeEnvPlugin').use(webpack.DefinePlugin, [{
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }]);
};
