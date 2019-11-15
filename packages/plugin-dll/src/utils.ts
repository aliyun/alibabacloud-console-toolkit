import { resolve } from "path";
import { DEP_JSON_NAME } from "./constants";
import { existsSync, writeFileSync, mkdirSync } from "fs";

export interface Deps {
  dllName: string;
  deps: string[];
}

export const getDeps = (dllOutputDir: string): Deps | null => {
  const depsFile = resolve(dllOutputDir, DEP_JSON_NAME);
  if (!existsSync(depsFile)) {
    return null;
  }
  try {
    return require(depsFile);
  } catch {
    return null;
  }
};

export const writeDeps = (dllOutputDir: string, deps: Deps) => {
  if (!existsSync(dllOutputDir)) {
    mkdirSync(dllOutputDir);
  }
  const depsFile = resolve(dllOutputDir, DEP_JSON_NAME);
  writeFileSync(depsFile, JSON.stringify(deps), 'utf-8');
  delete require.cache[depsFile];
};

