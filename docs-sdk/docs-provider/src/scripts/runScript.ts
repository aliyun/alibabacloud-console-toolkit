import execa from "execa";
import * as path from "path";
import * as fs from "fs-extra";

const outputPath = process.env.OUTPUT_PATH || "doc-dist";

export function runScript(
  scriptName: "deps-build" | "deps-serve" | "host-serve",
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
  const logPath = path.resolve(
    process.cwd(),
    outputPath,
    `log-${scriptName}.log`
  );
  fs.ensureDir(path.dirname(logPath));
  const depsLogStream = fs.createWriteStream(logPath);
  depsHandle.stdout?.pipe(depsLogStream);
  depsHandle.stderr?.pipe(depsLogStream);
  depsHandle.on("message", (msg: any) => {
    if (msg && msg.type === "server_started") {
      onGetPort && onGetPort(msg.port);
    }
  });
  return depsHandle;
}
