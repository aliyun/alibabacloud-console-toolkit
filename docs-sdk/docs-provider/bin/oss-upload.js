#!/usr/bin/env node
let OSS = require("ali-oss");
const fs = require("fs");
const path = require("path");
const globby = require("globby");
const qs = require("query-string");

const dir = process.env.OSS_DIR || `app/breezr-docs/`;
const name = process.env.OSS_NAME;
const tag = process.env.OSS_TAG || "latest";

const sourceDir = path.join(process.cwd(), process.argv[2] || "doc-dist");

if (!name) {
  throw new Error(`process.env.OSS_NAME must be given (package name)`);
}
if (!process.env.OSS_K) {
  throw new Error(`process.env.OSS_K must be given (accessKeyId)`);
}
if (!process.env.OSS_S) {
  throw new Error(`process.env.OSS_S must be given (accessKeySecret)`);
}
if (!fs.existsSync(sourceDir)) {
  throw new Error(`sourceDir "${sourceDir}" does not exist`);
}
const targetDir = path.join(dir, name, "-" + tag);

let client = new OSS({
  bucket: process.env.OSS_BUCKET || "opensource-microapp",
  region: process.env.OSS_REGION || "oss-cn-hangzhou",
  accessKeyId: process.env.OSS_K,
  accessKeySecret: process.env.OSS_S,
});

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
  if (delCount > 0) console.log(`Successfully delete ${delCount} old files`);
}

async function main() {
  await del();

  const files = await globby("**/*", {
    cwd: sourceDir,
  });

  let successCount = 0;

  let manifestURL;
  let consoleOSId;

  await Promise.all(
    files.map(async (filename) => {
      const res = await client.put(
        path.join(targetDir, filename),
        path.join(sourceDir, filename)
      );
      console.log(`[success] [${++successCount}/${files.length}] ${filename}`);
      if (!filename.startsWith("deps/") && filename.endsWith("manifest.json")) {
        manifestURL = res.url.replace(/^http:/, "https:");
        const manifest = JSON.parse(
          fs.readFileSync(path.join(sourceDir, filename))
        );
        consoleOSId = manifest.name;
      }
    })
  );

  const servePath = manifestURL.slice(0, manifestURL.lastIndexOf("/") + 1);
  console.log(`[成功] 上传构建产物 "${sourceDir}" 到OSS路径 "${servePath}"`);

  const previewURL = qs.stringifyUrl({
    url: "https://xconsole.aliyun-inc.com/demo-playground",
    query: { servePath, consoleOSId },
  });
  console.log(`预览url: ${previewURL} \n可以将它分享给其他同学！`);
}

main();
