#!/usr/bin/env node
let OSS = require("ali-oss");
const fs = require("fs");
const path = require("path");
const globby = require("globby");

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
  accessKeySecret: process.env.OSS_S
});

async function del() {
  let delCount = 0;
  while (true) {
    const list = await client.list({
      prefix: targetDir,
      "max-keys": 1000
    });
    list.objects = list.objects || [];
    const count = list.objects.length;
    if (count === 0) break;
    await Promise.all(list.objects.map(v => client.delete(v.name)));
    delCount += count;
  }
  if (delCount > 0) console.log(`Successfully delete ${delCount} old files`);
}

async function main() {
  await del();

  const files = await globby("**/*", {
    cwd: sourceDir
  });

  let successCount = 0;

  let manifestURL;

  await Promise.all(
    files.map(async filename => {
      const res = await client.put(
        path.join(targetDir, filename),
        path.join(sourceDir, filename)
      );
      console.log(`[success] [${++successCount}/${files.length}] ${filename}`);
      if (!filename.startsWith("deps/") && filename.endsWith("manifest.json")) {
        manifestURL = res.url;
      }
    })
  );

  console.log(
    `[success] upload all files from "${sourceDir}" to OSS path "${targetDir}"`
  );

  console.log(`manifest URL: ${manifestURL}`);
}

main();
