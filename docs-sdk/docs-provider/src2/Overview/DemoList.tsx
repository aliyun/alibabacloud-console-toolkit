import React from "react";
import copy from "copy-to-clipboard";
import toast from "react-hot-toast";

import styles from "./index.scoped.less";

interface IProps {
  entryKeys: string[];
  currentEntryKey?: string;
  onChange?: (newKey: string) => void;
  loadOpts: any;
}

const DemoList: React.FC<IProps> = ({
  entryKeys,
  currentEntryKey,
  onChange,
  loadOpts,
}) => {
  return (
    <ul className={styles.list}>
      {entryKeys.map((oneKey) => {
        return (
          <li
            className={
              (oneKey === currentEntryKey ? styles.active : "") +
              " " +
              styles.item
            }
            onClick={() => {
              if (typeof onChange === "function") {
                onChange(oneKey);
              }

              if (oneKey === currentEntryKey) {
                let { servePath, consoleOSId, entryKey } = loadOpts ?? {};
                if (!entryKey) return;
                servePath = encodeURIComponent(servePath);
                consoleOSId = encodeURIComponent(consoleOSId);
                entryKey = encodeURIComponent(entryKey);
                copy(
                  `https://xconsole.aliyun-inc.com/demo-playground?servePath=${servePath}&consoleOSId=${consoleOSId}&entryKey=${entryKey}`
                );
                toast("已将demo地址复制到剪贴板");
              }
            }}
            key={oneKey}
          >
            {oneKey}
          </li>
        );
      })}
    </ul>
  );
};

export default DemoList;
