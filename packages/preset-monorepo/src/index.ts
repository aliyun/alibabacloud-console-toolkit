import { runCLI } from 'jest-cli';
import * as path from 'path';
import { writeFileSync, readdir, stat } from 'fs';
import { promisify } from 'util';
import { fork } from 'child_process';

const readdirAsync = promisify(readdir);
const statAsync = promisify(stat);

const JEST_CONFIG_PATH = path.resolve(__dirname, 'mono-root.jest.config.js');

// 创建一个子进程来解析单个子包的jest配置
// 因为breezr instance的一些资源很难释放，在主进程做会把内存泄漏带到主进程来
// 比如，我们会加载每个子包的node_modules里的breezr-service等模块，这些模块加载以后就不会释放，保存在模块缓存中
// 主进程仅仅需要解析出的jest配置（一个普通对象）而已，因此我们将实例化breezr instance的工作放在子进程中，方便资源的释放
async function forkChildProcessToGetJestConfigForPackage(packageDir: string) {
  return new Promise((res, rej) => {
    const forked = fork(path.resolve(__dirname, 'childProcess.js'));
    let jestConfig: object | undefined, error: object | undefined;
    forked.on('message', ({ success, data, err }) => {
      if (success === true) {
        jestConfig = data;
      } else {
        error = err;
      }
      forked.kill();
    });
    forked.on('error', err => {
      error = err;
      forked.kill();
    });
    forked.on('exit', () => {
      if (typeof jestConfig === 'object') {
        res(jestConfig);
      } else {
        rej(error || { msg: 'forked process exist. unknow error' });
      }
    });
    forked.send({ packageDir });

    // 20s timeout for each process
    setTimeout(() => {
      rej({
        msg: `timeout for childProcess: getJestConfigForPackage("${packageDir}")`,
        jestConfig,
        error,
      });
    }, 20 * 1000);
  });
}

// 同getJestConfigForPackage，但是它只是”尝试“，如果无法解析出jest配置，则返回null
async function tryToGetJestConfigForPackage(packageDir: string) {
  const dirStats = await statAsync(packageDir);
  if (dirStats.isDirectory()) {
    try {
      return await forkChildProcessToGetJestConfigForPackage(packageDir);
    } catch (error) {
      // swallow errors
      // 有一些包可能没有配置breezr测试，甚至没有breezr，很正常
      // 如果要debug，可以在这里打印error
      // console.log(error);
      return null;
    }
  }
  return null;
}

// 对参数中的所有文件夹执行tryToGetJestConfigForPackage
async function detectJestConfigsFromPackageDirs(packageDirs: string[]) {
  const jestConfigs = (await Promise.all(
    packageDirs.map(async packageDir =>
      tryToGetJestConfigForPackage(packageDir)
    )
  )).filter(item => !!item);
  return jestConfigs;
}

// dirWithPackages 通常是monorepo中的"packages"文件夹
async function detectJestConfigsFromDirWithPackages(dirWithPackages: string) {
  const packageDirs = (await readdirAsync(dirWithPackages)).map(fileName =>
    path.resolve(dirWithPackages, fileName)
  );
  return detectJestConfigsFromPackageDirs(packageDirs);
}

export default async (config: IOption, cmdArgs: any) => {
  const { packageDirs, dirWithPackages } = config;
  const monoRootDir = config.monoRootDir || process.cwd();

  let jestConfigs;
  if (packageDirs) {
    jestConfigs = await detectJestConfigsFromPackageDirs(packageDirs);
  } else if (dirWithPackages) {
    jestConfigs = await detectJestConfigsFromDirWithPackages(dirWithPackages);
  } else {
    jestConfigs = await detectJestConfigsFromDirWithPackages(
      path.resolve(monoRootDir, 'packages')
    );
  }

  const rootJestConfig = {
    projects: jestConfigs,
  };
  // 调用runCLI的时候，必须提供配置【路径】，直接传入配置对象会出问题
  // 因此我们先把解析好的配置写到一个文件中，然后通过这个文件的路径来指定jest配置
  writeFileSync(
    JEST_CONFIG_PATH,
    `module.exports=${JSON.stringify(rootJestConfig)}`
  );

  const bootJest = async (jestConfig: any, cliArgs: any) => {
    await runCLI(
      {
        config: JEST_CONFIG_PATH,
        coverageDirectory: path.resolve(monoRootDir, 'coverage'),
        ...cliArgs,
      } as any,
      [monoRootDir]
    );
  };

  const plugins = [
    [
      require.resolve('@alicloud/console-toolkit-plugin-unit-jest'),
      {
        bootJest: bootJest,
      },
    ],
  ];
  return {
    plugins,
  };
};
