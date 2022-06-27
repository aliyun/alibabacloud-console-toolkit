import * as path from 'path';

import * as execa from 'execa';
import * as fs from 'fs-extra';
import { getEnv } from '@alicloud/console-toolkit-shared-utils';

export function runScript(
  scriptName: 'deps-build' | 'deps-serve' | 'host-serve',
  {
    cwd,
    env,
    onGetPort,
  }: { cwd?: string; env?: any; onGetPort?: (port: string) => void }
) {
  const depsHandle = execa.node(
    path.resolve(__dirname, `./${scriptName}.js`),
    undefined,
    {
      cwd: cwd ?? process.cwd(),
      env,
    }
  );
  depsHandle.catch((err) => {
    console.error(`runScript error. scriptName: "${scriptName}", error:`);
    console.error(err);
  });

  const outputPath = env?.OUTPUT_PATH;
  if (!outputPath) {
    throw new Error(`env.OUTPUT_PATH should be defined`);
  }

  let depsLogStream;
  const buildEnv = getEnv();
  if (buildEnv.isCloudBuild()) {
    depsLogStream = process.stdout;
  } else {
    const logPath = path.resolve(
      process.cwd(),
      outputPath,
      `log-${scriptName}.log`
    );
    fs.ensureDirSync(path.dirname(logPath));
    depsLogStream = fs.createWriteStream(logPath);
  }

  depsHandle.stdout?.pipe(depsLogStream);
  depsHandle.stderr?.pipe(depsLogStream);
  depsHandle.on('message', (msg: any) => {
    if (msg && msg.type === 'server_started') {
      onGetPort && onGetPort(msg.port);
    }
  });
  return depsHandle;
}
