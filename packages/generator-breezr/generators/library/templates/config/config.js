module.exports = {
  presets: [
    [
      "@alicloud/console-toolkit-preset-component",
      {
        moduleName: "<%= lowerCaseName %>",
        globals: {
          "<%= lowerCaseName %>": "<%= upperCaseName %>"
        }
      }
    ]
  ]
};