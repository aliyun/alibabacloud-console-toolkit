// NODE_ENV 初始化
if (!process.env.NODE_ENV) {
  console.info('NODE_ENV is not set on process.env.');

  // DEF 云端构建时 node_env 必须是 production
  if (process.env.BUILD_ENV === 'cloud') {
    process.env.NODE_ENV = 'production';
    console.info('set NODE_ENV=production.');
  } else {
    // 默认 NODE_ENV 为 development
    process.env.NODE_ENV = 'development';
    console.info('set NODE_ENV=development.');
  }
}
