import React, { useEffect } from "react";
import { createCodesandbox } from "./createCodesandbox";

// @ts-ignore
import codesandboxModifier from "/@codesandboxModifier";

interface IProps {
  codesandboxUrl: string;
  setUrl: (url: string) => void;
  code: string;
  imports: string[];
  meta: any;
}

const CodeSandbox: React.FC<IProps> = ({
  codesandboxUrl,
  setUrl,
  code,
  imports,
  meta
}) => {
  useEffect(() => {
    if (!codesandboxUrl) {
      createCodesandbox({
        code,
        imports,
        modifyCode: files => codesandboxModifier(files, meta)
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
