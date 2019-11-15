// @ts-ignore
const sendMsg: (data: {
  success: boolean;
  data?: object;
  err?: object;
  // @ts-ignore
}) => void = process.send.bind(process);


async function getJestConfigForPackage(packageDir: string) {
  // 用【子包下的node_modules的@alicloud/console-toolkit-cli包】来创建一个breezr实例
  // 由这个breezr实例来读取子包的breezr配置
  const { Service: BreezrService } = require(require.resolve(
    '@alicloud/console-toolkit-core',
    {
      paths: [packageDir],
    }
  ));
  const breezrInstance = new BreezrService({ cwd: packageDir });
  await breezrInstance.init({});
  const packageJestConfig = breezrInstance.invokeSync('getJestConfig');
  return packageJestConfig;
}

process.on('message', async ({ packageDir }) => {
  // validate arguments
  if (!packageDir) {
    sendMsg({
      success: false,
      err: {
        msg: 'no packageDir given',
      },
    });
    return;
  }
  // try to get jestConfig
  let jestConfig;
  try {
    jestConfig = await getJestConfigForPackage(packageDir);
  } catch (error) {
    sendMsg({
      success: false,
      err: {
        msg: `error from getJestConfigForPackage("${packageDir}")`,
        error,
      },
    });
    return;
  }
  // validate result
  if (typeof jestConfig !== 'object') {
    sendMsg({
      success: false,
      err: {
        msg: `expect jestConfig to be object, but got ${jestConfig}`,
      },
    });
    return;
  }
  // success
  sendMsg({
    success: true,
    data: jestConfig,
  });
});