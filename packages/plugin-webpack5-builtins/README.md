本包没有任何内容，只是用于安装 webpack5 相关的依赖。由于 tnpm hoist 机制，导致相关的依赖都会安装到 node_modules 的根目录，导致高版本依赖会顶替调低版本的依赖，当高版本依赖引入 break changes 时，就会导致构建时错误或运行时错误。