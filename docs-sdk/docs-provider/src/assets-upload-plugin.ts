import type { IParams } from "./index";

export default (api: any, opts: IParams) => {
  const { consoleOSId } = opts;
  if (!consoleOSId) throw new Error("should have consoleOSId");

  api.registerCommand(
    "upload",
    {
      description: "upload docs to oss",
      usage: `breezr upload`,
    },
    async (args) => {
      console.log("args", args);
      console.log("consoleOSId", consoleOSId);

      const OSS = require("ali-oss");
      const fs = require("fs");
      const path = require("path");
      const globby = require("globby");
      const qs = require("query-string");

      // 具名参数，要上传到oss的哪个位置
      const dir = process.env.OSS_DIR || args.dir || `app/breezr-docs/`;
      const name = process.env.OSS_NAME || args.name || consoleOSId;
      const tag = process.env.OSS_TAG || args.tag || "latest";
      const targetDir = path.join(dir, name, "-" + tag);

      // 第一个位置参数是要上传的本地目录
      const sourceDir = path.resolve(process.cwd(), args._[1] || "doc-dist");

      if (!name) {
        throw new Error(
          `package name must be given (.e.g breezr upload --name=@scope/my-name)`
        );
      }
      if (!process.env.OSS_K) {
        throw new Error(
          `process.env.OSS_K must be given (oss的 accessKeyId ，联系萧雨申请)`
        );
      }
      if (!process.env.OSS_S) {
        throw new Error(
          `process.env.OSS_S must be given (oss的 accessKeySecret ，联系萧雨申请)`
        );
      }
      if (!fs.existsSync(sourceDir)) {
        throw new Error(`sourceDir "${sourceDir}" does not exist`);
      }

      let client = new OSS({
        bucket: process.env.OSS_BUCKET || "opensource-microapp",
        region: process.env.OSS_REGION || "oss-cn-hangzhou",
        accessKeyId: process.env.OSS_K,
        accessKeySecret: process.env.OSS_S,
      });

      await del();

      const files = await globby("**/*", {
        cwd: sourceDir,
      });

      let successCount = 0;
      let manifestURL;

      await Promise.all(
        files.map(async (filename) => {
          const res = await client.put(
            path.join(targetDir, filename),
            path.join(sourceDir, filename)
          );
          console.log(
            `[success] [${++successCount}/${files.length}] ${filename}`
          );
          if (
            !filename.startsWith("deps/") &&
            filename.endsWith("manifest.json")
          ) {
            manifestURL = res.url.replace(/^http:/, "https:");
          }
        })
      );

      const servePath = manifestURL.slice(0, manifestURL.lastIndexOf("/") + 1);
      console.log(
        `[成功] 上传构建产物 "${sourceDir}" 到OSS路径 "${servePath}"`
      );

      const previewURL = qs.stringifyUrl({
        url: "https://xconsole.aliyun-inc.com/demo-playground",
        query: { servePath, consoleOSId },
      });
      console.log(`预览url: ${previewURL} \n可以将它分享给其他同学！`);

      async function del() {
        let delCount = 0;
        while (true) {
          const list = await client.list({
            prefix: targetDir,
            "max-keys": 1000,
          });
          list.objects = list.objects || [];
          const count = list.objects.length;
          if (count === 0) break;
          await Promise.all(list.objects.map((v) => client.delete(v.name)));
          delCount += count;
        }
        if (delCount > 0)
          console.log(`Successfully delete ${delCount} old files`);
      }
    }
  );
};
