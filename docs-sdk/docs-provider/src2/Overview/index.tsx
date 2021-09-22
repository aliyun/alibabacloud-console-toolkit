import React from "react";
import { Toaster } from "react-hot-toast";

import Loader, { entries } from "../Loader";
import styles from "./index.scoped.less";
import DemoList from "./DemoList";

import type { IOverviewProps } from "@alicloud/console-toolkit-docs-shared";

const entryKeys = entries.map(({ key }) => key);

const Overview: React.FC<IOverviewProps> = ({
  entryKey,
  onEntryKeyChange,
  ...restLoaderProps
}) => {
  const { loadOpts } = restLoaderProps as any;
  return (
    <div className={styles.container}>
      <Toaster position="bottom-right" />
      <DemoList
        entryKeys={entryKeys}
        currentEntryKey={entryKey}
        onChange={onEntryKeyChange}
        loadOpts={loadOpts}
      />
      <hr />
      {entryKey && (
        <div className={styles.widgetCtn}>
          <Loader {...restLoaderProps} key={entryKey} entryKey={entryKey} />
        </div>
      )}
    </div>
  );
};

export default Overview;
