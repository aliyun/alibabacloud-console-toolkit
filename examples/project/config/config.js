const path = require('path');

module.exports = {
  plugins: [
    ['plugin-react', { entry: path.resolve(process.cwd(), './src/index.tsx') }],
  ],
};
