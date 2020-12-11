const path = require("path");
const globby = require("globby");

module.exports = {
  presets: [
    [
      // require.resolve("./lib"),
      require.resolve("@alicloud/console-toolkit-preset-docs"),
      {
        consoleOSId: "consumer-docs",
        getMarkdownEntries: () => {
          return [
            {
              key: "doc",
              path: path.resolve(__dirname, "./document.md"),
            },
          ];
        },
      },
    ],
  ],
};
