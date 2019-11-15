import { FullVersion } from 'package-json';

export interface IGitContext {
  repo: string;
  branch: string;
  path: string;
  id: string;
  isLocal: boolean;
  sourcePath: string;
}

export interface IContext extends IGitContext {
  sourcePath: string;
  branch: string;
  templateTmpDirPath: string;
  blocksTempPath: string;
  repoExists: boolean;
  pkg: FullVersion;
}
