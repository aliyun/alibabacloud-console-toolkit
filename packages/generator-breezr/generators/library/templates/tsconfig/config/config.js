module.exports = {
  presets: [
    [
      "@alicloud/console-toolkit-preset-component",
      {
        moduleName: "<%= lowerCaseName %>",
        external: ["widget-loader"],
        globals: {
          "<%= lowerCaseName %>": "<%= upperCaseName %>"
        },
        useTypescript: true
      }
    ]
  ]
};
