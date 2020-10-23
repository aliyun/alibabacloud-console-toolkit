const path = require("path");
const globby = require("globby");

module.exports = {
  presets: [
    [
      // require.resolve("./lib"),
      require.resolve("@alicloud/console-toolkit-preset-multi-entry"),
      {
        consoleOSId: "xconsole-demos",
        getDemos() {
          const baseDir = path.resolve(__dirname, "./src/demos/");
          const paths = globby.sync("**/*.tsx", { cwd: baseDir });
          const res = paths.map(relativePath => {
            return {
              key: "demos/" + relativePath,
              path: path.resolve(baseDir, relativePath)
            };
          });
          return res;
        },
        getMarkdownEntries: () => {
          const baseDir = path.resolve(__dirname, "./src/markdowns");
          const paths = globby.sync("**/*.md", { cwd: baseDir });
          const res = paths.map(relativePath => {
            return {
              key: "docs/" + relativePath,
              path: path.resolve(baseDir, relativePath)
            };
          });
          return res;
        }
      }
    ]
  ]
};
