import React from "react";
import Loader, { entries, ILoaderProps } from "../Loader";
import styles from "./index.scoped.less";
import DemoList from "./DemoList";

interface IProps extends ILoaderProps {
  onEntryKeyChange?: (newkey: string) => void;
}

const entryKeys = entries.map(({ key }) => key);

const Overview: React.FC<IProps> = ({
  entryKey,
  onEntryKeyChange,
  resolveAppServePath,
  resolveAppDeps,
  markdownOpts = { toc: true },
  ...restLoaderProps
}) => {
  return (
    <div className={styles.container}>
      <DemoList
        entryKeys={entryKeys}
        currentEntryKey={entryKey}
        onChange={onEntryKeyChange}
      />
      <hr />
      <div className={styles.widgetCtn}>
        <Loader
          {...restLoaderProps}
          key={entryKey}
          entryKey={entryKey}
          markdownOpts={markdownOpts}
        />
      </div>
    </div>
  );
};

export default Overview;
