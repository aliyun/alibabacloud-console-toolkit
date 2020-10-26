import React, { useEffect, useState } from "react";
import { IDemoOpts, ICodeSandboxFiles } from "..";
import { createCodesandbox } from "./createCodesandbox";

// @ts-ignore
import buildTimeDemoOpts from "/@demoOpts";

interface IProps {
  code: string;
  imports: string[];
  meta: any;
  modifyCodeSandbox?: IDemoOpts["modifyCodeSandbox"];
}

const CodeSandbox: React.FC<IProps> = ({
  code,
  imports,
  meta,
  modifyCodeSandbox
}) => {
  const [codesandboxUrl, setUrl] = useState("");

  useEffect(() => {
    // 切换demo的时候，重置 codesandboxUrl
    setUrl("");
  }, [code]);

  useEffect(() => {
    if (!codesandboxUrl) {
      createCodesandbox({
        code,
        imports,
        modifyCode: files => {
          let res: ICodeSandboxFiles = files;
          // 构建者提供的 codesandboxModifier
          if (buildTimeDemoOpts.modifyCodeSandbox) {
            res = buildTimeDemoOpts.modifyCodeSandbox({
              code,
              meta,
              imports,
              files
            });
          }
          // 加载者提供的 codesandboxModifier
          if (modifyCodeSandbox) {
            res = modifyCodeSandbox({ code, meta, imports, files: res });
          }
          return res;
        }
      }).then(({ url }) => {
        setUrl(url);
      });
    }
  }, [codesandboxUrl]);

  if (codesandboxUrl) {
    return (
      <iframe
        sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
        style={iframeStyle}
        src={codesandboxUrl}
      />
    );
  }

  return <div style={{ ...iframeStyle, padding: 24 }}>Loading...</div>;
};

const iframeStyle: React.CSSProperties = {
  border: 0,
  width: "100%",
  minHeight: 520
};

export default CodeSandbox;
