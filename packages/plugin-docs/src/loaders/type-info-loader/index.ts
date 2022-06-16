import { collectInterfaceInfo } from "./collectInterfaceInfo";

export default function typeInfoLoader(this: any, content: string) {
  const filePath = this.resourcePath;

  const info = collectInterfaceInfo(filePath);

  return `export default ${JSON.stringify(info)}`;
}
