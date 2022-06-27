import React from "react";
import queryString from "query-string";
import { Toaster } from "react-hot-toast";

import Loader, { entries } from "../Loader";
import styles from "./index.scoped.less";
import DemoList from "./DemoList";

import type { IOverviewProps } from "@alicloud/console-toolkit-docs-shared";

declare const window: Window;

const entryKeys = entries.map(({ key }) => key);

const Overview: React.FC<IOverviewProps> = ({
  entryKey,
  onEntryKeyChange,
  ...restLoaderProps
}) => {
  const { loadOpts } = restLoaderProps as any;
  const isDemoOnly = Boolean(queryString.parseUrl(window.location.href)?.query?.demoOnly);
  return (
    <div>
      {
        isDemoOnly && entryKey ? (
          <Loader {...restLoaderProps} key={entryKey} entryKey={entryKey} />
        ) : (
          <div>
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
        )
      }
    </div>
  );
};

export default Overview;
