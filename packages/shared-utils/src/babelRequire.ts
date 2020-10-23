export const babelRegister = (paths: string[]) => {
  require("@babel/register")({
    only: [
      ...paths
    ],
    presets: [require.resolve('@umijs/babel-preset-umi/node')],
    ignore: [/node_modules/],
    extensions: ['.jsx', '.js', '.ts', '.tsx'],
    babelrc: false,
    cache: false,
  });
}