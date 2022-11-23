import * as fs from "fs";
import * as path from "path";
import * as babel from "@babel/core";
import includes from "lodash/includes";
import readdirRecursive = require("fs-readdir-recursive");

const CALLER = {
  name: "breezr-plugin-babel"
};

export function chmod(src: string, dest: string) {
  fs.chmodSync(dest, fs.statSync(src).mode);
}

export function addSourceMappingUrl(code: string, loc: string): string {
  return code + "\n//# sourceMappingURL=" + path.basename(loc);
}

type ReaddirFilter = (filename: string) => boolean;

export function readdir(
  dirname: string,
  includeDotfiles: boolean = false,
  filter?: ReaddirFilter
) {
  return readdirRecursive(
    dirname,
    (filename: string, _index: number, currentDirectory: string) => {
      const stat = fs.statSync(path.join(currentDirectory, filename));

      if (stat.isDirectory()) return true;

      return (
        (includeDotfiles || filename[0] !== ".") && !filename.endsWith('.d.ts') &&
        (!filter || filter(filename))
      );
    }
  );
}

/**
 * Test if a filename ends with a compilable extension.
 */
export function isCompilableExtension(
  filename: string,
  altExts?: string[]
): boolean {
  const exts = altExts || babel.DEFAULT_EXTENSIONS;
  const ext = path.extname(filename);
  return includes(exts, ext);
}

/**
 * delete path dir or file
 * @param {string} path path to delete
 */
export function deleteDir(path: string) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file: string) {
      const curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteDir(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

export function compile(filename: string, opts: any): any {
  opts = {
    ...opts,
    caller: CALLER
  };

  return new Promise((resolve, reject) => {
    babel.transformFile(filename, opts, (err: any, result: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export function adjustRelative(
  relative: string,
  keepFileExtension: boolean = false
) {
  if (keepFileExtension) {
    return relative;
  }
  return relative.replace(/\.(\w*?)$/, "") + ".js";
}

export function requireChokidar() {
  try {
    return require("chokidar");
  } catch (err) {
    console.error(
      "The optional dependency chokidar failed to install and is required for " +
        "--watch. Chokidar is likely not supported on your platform.",
    );
    throw err;
  }
}

/**
 * catch uncaughtException
 */
process.on("uncaughtException", function(err) {
  console.error(err);
  process.exit(1);
});
