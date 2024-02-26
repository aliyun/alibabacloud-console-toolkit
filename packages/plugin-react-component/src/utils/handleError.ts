export default function handleError(e: Error) {
  if (!e.message) return;

  // rollup-plugin-typescript2 会对空文件报错
  const notFoundFile = /TS6053:.*File (.*) not found\./.exec(e.message)?.[1];

  if (notFoundFile) {
    throw new Error(`${notFoundFile} should not be empty, please check it.`);
  }

  throw e;
}
