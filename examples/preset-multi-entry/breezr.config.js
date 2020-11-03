const path = require("path");
const globby = require("globby");

module.exports = {
  presets: [
    [
      // require.resolve("./lib"),
      require.resolve("@alicloud/console-toolkit-preset-multi-entry"),
      {
        consoleOSId: "multi-entry-fixture",
        getDemos() {
          const baseDir = path.resolve(__dirname, "./src/demos/");
          const paths = globby.sync("**/*.tsx", { cwd: baseDir });
          const res = paths.map(relativePath => {
            return {
              key: "demos/" + path.parse(relativePath).name,
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
              key: "docs/" + path.parse(relativePath).name,
              path: path.resolve(baseDir, relativePath)
            };
          });
          return res;
        },
        demoOptsPath: path.resolve(__dirname, "./demoOpts"),
        externals: [
          {
            moduleName: "test-external-module",
            usePathInDev: path.resolve(
              __dirname,
              "./src/test-external-module-in-dev.ts"
            )
          }
        ],
        resolveAppServePath: path.resolve(__dirname, "./resolveAppServePath.ts")
      }
    ]
  ]
};
