import matter from "gray-matter";

export default async function mdFileStaticMetaLoader(
  this: any,
  content: string
) {
  const res = matter(content);
  return `export const staticMeta = ${JSON.stringify(res.data)};`;
}
