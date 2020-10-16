import React, { useEffect, useState } from "react";
// @ts-ignore
import DemoContainer from "/@DemoContainer";
// @ts-ignore
import DemoWrapper from "/@DemoWrapper";

// @ts-ignore
import demos from "/@demos-list";

// @ts-ignore
import "/@initializer";

export const demoKeys = demos.map(({ key }) => key);

interface IDemoInfo {
  Component: React.ComponentType;
  code: string;
  imports: string[];
  meta?: any;
}

const DemoLoader: React.FC<{
  demoKey: string;
}> = ({ demoKey }) => {
  const [demo, setDemo] = useState<null | IDemoInfo>(null);

  useEffect(() => {
    if (!demoKey) {
      return;
    }
    const found = demos.find(({ key }) => key === demoKey);
    if (found) {
      found.load().then(m => {
        const { demo: Component, meta, code, imports } = m;
        setDemo({ Component, code, imports, meta });
      });
    }
  }, [demoKey]);

  return demo ? (
    <DemoContainer
      code={demo.code}
      imports={demo.imports}
      DemoWrapper={DemoWrapper}
      meta={demo.meta}
    >
      <demo.Component />
    </DemoContainer>
  ) : null;
};

export default DemoLoader;
