const path = require('path');

module.exports = {
  plugins: [
    '@alicloud/console-toolkit-plugin-builtin',
    [
      path.resolve(__dirname, '../../lib/index.js'),
      {
        classNamePrefix: 'WIND_PRO',
        condition: 'widget'
      }
    ]
  ]
};
