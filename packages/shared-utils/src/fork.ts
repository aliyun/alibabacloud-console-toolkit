import { fork as forkChild } from "child_process";
import { debug } from "./debug";

export const DONE = "DONE";
export const STARTING = "STARTING";
export const RESTART = "RESTART";

function send(message: any) {
  if (process.send) {
    debug("shared-utils", `send ${JSON.stringify(message)}`);
    process.send(message);
  }
}

export function fork(scriptPath: string) {
  const execArgv = process.execArgv.slice(0);

  // 替换--inspect参数，防止错误
  // “Starting inspector on 127.0.0.1:9229 failed: address already in use”
  const currentInspectArgIdx = execArgv.findIndex(a =>
    a.startsWith("--inspect")
  );
  if (currentInspectArgIdx >= 0) {
    const currentInspectArg = execArgv[currentInspectArgIdx];
    const currentPort = Number(currentInspectArg.split("=")[1] || "9229");
    const forkInspectArg =
      currentInspectArg.split("=")[0] + "=" + String(currentPort + 1);
    console.log(
      `发现当前进程有node inspect参数"${currentInspectArg}". 因此我们fork的进程时候也加入node inspect参数"${forkInspectArg}"`
    );
    execArgv.splice(currentInspectArgIdx, 1, forkInspectArg);
  }

  const child = forkChild(scriptPath, process.argv.slice(2), { execArgv });

  child.on("message", data => {
    const type = (data && data.type) || null;
    if (type === RESTART) {
      child.kill();
      fork(scriptPath);
    }
    send(data);
  });

  return child;
}
