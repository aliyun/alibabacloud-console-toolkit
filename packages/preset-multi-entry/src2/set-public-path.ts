// @ts-nocheck
import env from "@alicloud/console-os-environment";

// console.log("@alicloud/console-os-environment", env);

// 解决dynamic import的public path问题
__webpack_public_path__ = env.publicPath;
