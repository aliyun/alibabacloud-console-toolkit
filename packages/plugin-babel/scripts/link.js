const fs = require('fs')
const path = require('path')

function symlinkNodeModule(moduleId, moduleRoot) {
  let modulePath = '';
  try {
    modulePath = path.resolve(moduleRoot, `./node_modules/${moduleId}`);
  } catch (e) {
    console.log(e.stack);
  }

  /**
   * npm install 的时候 proccess.cwd() 会指向本包目录, 而不是项目的目录
   * 导致 targetModulePath === modulePath. symbole link 到自身 无限循环.
   * 在 npm 5.4 加入了 INIT_CWD 环境变量, 指向了 npm install 的 工作目录
   * 
   * @see https://github.com/npm/npm/issues/16990
   * @see https://github.com/npm/npm/pull/12356
   */
  const cwd = process.env.INIT_CWD || process.cwd();
  const targetModulePath = path.resolve(cwd, `node_modules/${moduleId}`);
  console.log(modulePath, targetModulePath);
  if (modulePath && !fs.existsSync(targetModulePath)) {
    console.log(modulePath, targetModulePath);
    fs.symlinkSync(modulePath, targetModulePath, 'junction');
  }
}

try {
  symlinkNodeModule('@babel/core', path.resolve(__dirname, '../'));
} catch(e) {
  
}