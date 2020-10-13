import React, { useEffect, useState } from "react";
// import { ConfigProvider } from "@alife/alicloud-components";
// @ts-ignore
import DemoContainer from "/@DemoContainer";
// @ts-ignore
import DemoWrapper from "/@DemoWrapper";

// @ts-ignore
import demos from "/@demos-list";

export const demoKeys = demos.map(({ key }) => key);

interface IDemoInfo {
  Component: React.ComponentType;
  code: string;
  title: string;
  describe: string;
}

const DemoLoader: React.FC<{
  demoId: string;
}> = ({ demoId }) => {
  const [demo, setDemo] = useState<null | IDemoInfo>(null);

  useEffect(() => {
    if (!demoId) return;
    const found = demos.find(({ key }) => key === demoId);
    if (found) {
      found.load().then(m => {
        const { demo: Component, meta, code } = m;
        const { title, describe } = meta ?? {};
        setDemo({ Component, code, title, describe });
      });
    }
  }, [demoId]);

  return demo ? (
    <DemoContainer
      title={demo.title}
      describe={demo.describe}
      code={demo.code}
      DemoWrapper={DemoWrapper}
    >
      <demo.Component />
    </DemoContainer>
  ) : null;
};

export default DemoLoader;
