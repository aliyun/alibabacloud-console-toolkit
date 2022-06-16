import { extract, parse } from "jest-docblock";

export default async function jsFileStaticMetaLoader(
  this: any,
  content: string
) {
  const meta = parse(extract(content));
  return `export const staticMeta = ${JSON.stringify(meta)};`;
}
