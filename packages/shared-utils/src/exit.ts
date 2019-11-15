const exitProcess = true;

export const exit = function (code: number) {
  if (exitProcess) {
    process.exit(code);
  } else if (code > 0) {
    throw new Error(`Process exited with code ${code}`);
  }
};
