module.exports = {
  extends: [
    './react',
    './ts',
    './config/tsx'
  ].map(require.resolve)
};
