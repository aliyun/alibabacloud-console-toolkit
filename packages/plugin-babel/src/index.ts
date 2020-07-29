import * as fs from "fs";
import * as path from "path";
import { PluginAPI } from "@alicloud/console-toolkit-core";
import { debug } from '@alicloud/console-toolkit-shared-utils';
import outputFileSync from "output-file-sync";
import slash from "slash";
import defaults from "lodash/defaults";
import { sync as mkdirpSync } from "mkdirp";
import * as util from "./util";

/**
 * 构建相关的自定义的 options
 */
interface ICliOptions {
  outDir: string;
  filenames: string[];
  includeDotfiles?: boolean;
  deleteDirOnStart?: boolean;
  copyFiles?: boolean;
  relative?: boolean;
  watch?: boolean;
  extensions?: string[];
  keepFileExtension?: boolean;
  verbose?: boolean;
  filter?: (fileName: string) => boolean;
}


/**
 * babel 的原始 options
 */
interface IBabelOptions {
  sourceMaps?: string;
}

interface IBabelAPIOpt {
  babelOptions: IBabelOptions;
  cliOptions: ICliOptions;
}

export default (api: PluginAPI, config: IBabelAPIOpt) => {
  api.registerAPI(
    "babel",
    async ({ cliOptions: cliOpts, babelOptions }: IBabelAPIOpt) => {

      debug('babel', 'config is %j %j', config, {
        ...config.babelOptions,
        ...babelOptions
      });
      const cliOptions = {
        ...cliOpts,
        ...config.cliOptions
      };

      function getDest(filename: string, base: string) {
        if (cliOptions.relative) {
          return path.join(base, cliOptions.outDir, filename);
        }
        return path.join(cliOptions.outDir, filename);
      }

      async function write(src: string, base: string) {
        let relative = path.relative(base, src);
        if (!util.isCompilableExtension(relative, cliOptions.extensions)) {
          return false;
        }

        // remove extension and then append back on .js
        relative = util.adjustRelative(relative, cliOptions.keepFileExtension);

        const dest = getDest(relative, base);
        try {
          const res = await util.compile(
            src,
            defaults(
              {
                sourceFileName: slash(path.relative(dest + "/..", src))
              },
              {
                ...config.babelOptions,
                ...babelOptions
              }
            )
          );

          if (!res) {
            return false;
          }

          // we've requested explicit sourcemaps to be written to disk
          if (
            res.map &&
            babelOptions.sourceMaps &&
            babelOptions.sourceMaps !== "inline"
          ) {
            const mapLoc = dest + ".map";
            res.code = util.addSourceMappingUrl(res.code, mapLoc);
            res.map.file = path.basename(relative);
            outputFileSync(mapLoc, JSON.stringify(res.map));
          }

          outputFileSync(dest, res.code);
          util.chmod(src, dest);

          if (cliOptions.verbose) {
            console.log(src + " -> " + dest);
          }

          return true;
        } catch (err) {
          if (cliOptions.watch) {
            console.error(err);
            return false;
          }

          throw err;
        }
      }

      async function handleFile(src: string, base: string) {
        const written = await write(src, base);

        if (!written && cliOptions.copyFiles) {
          const filename = path.relative(base, src);
          const dest = getDest(filename, base);
          outputFileSync(dest, fs.readFileSync(src));
          util.chmod(src, dest);
        }
        return written;
      }

      async function handle(filenameOrDir: string) {
        if (!fs.existsSync(filenameOrDir)) {
          return 0;
        }

        const stat = fs.statSync(filenameOrDir);

        if (stat.isDirectory()) {
          const dirname = filenameOrDir;

          let count = 0;

          const files = util.readdir(
            dirname,
            cliOptions.includeDotfiles,
            cliOptions.filter
          );
          for (const filename of files) {
            const src = path.join(dirname, filename);

            const written = await handleFile(src, dirname);
            if (written) {
              count += 1;
            }
          }

          return count;
        } else {
          const filename = filenameOrDir;
          const written = await handleFile(filename, path.dirname(filename));

          return written ? 1 : 0;
        }
      }

      if (cliOptions.deleteDirOnStart) {
        util.deleteDir(cliOptions.outDir);
      }

      mkdirpSync(cliOptions.outDir);

      let compiledFiles = 0;
      for (const filename of cliOptions.filenames) {
        compiledFiles += await handle(filename);
      }

      console.log(
        `Successfully compiled ${compiledFiles} ${
          compiledFiles !== 1 ? "files" : "file"
        } with Babel.`
      );

      if (cliOptions.watch) {
        const chokidar = util.requireChokidar();

        cliOptions.filenames.forEach(function(filenameOrDir) {
          const watcher = chokidar.watch(filenameOrDir, {
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: {
              stabilityThreshold: 50,
              pollInterval: 10,
            },
          });

          ["add", "change"].forEach(function(type) {
            watcher.on(type, function(filename: string) {
              handleFile(
                filename,
                filename === filenameOrDir
                  ? path.dirname(filenameOrDir)
                  : filenameOrDir,
              ).catch(err => {
                console.error(err);
              });
            });
          });
        });
      }
    }
  );
};
