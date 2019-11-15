# babel-plugin-wind

按需引用 ``wind`` 中的组件

## 安装

```
npm i -D babel-plugin-wind
```

## 使用

### .bablerc

```
{
  "plugins": [
    "babel-plugin-wind"
  ]
}
```

### babel-loader

__Webpack__

```
module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              'babel-plugin-wind'
            ]
          }
        }
      }
    ]
  }
}
```