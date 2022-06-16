// @ts-nocheck
import env from "@alicloud/breezr-docs-environment";

const actualPublicPath = env?.publicPath;

if (!actualPublicPath) {
  console.error(
    "找不到env.publicPath！可能是加载器版本和构建器版本不兼容",
    env
  );
}

// 解决dynamic import的public path问题
__webpack_public_path__ = actualPublicPath || "/env-publicPath-not-found/";
