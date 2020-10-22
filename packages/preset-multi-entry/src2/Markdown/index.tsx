import React, { useMemo } from "react";
import { MarkdownRenderer } from "@alicloud/console-toolkit-markdown-renderer";

export function mdRenderer(md: string) {
  const WrappedDocComp: React.FC<{
    changeMdSource?: (original: string) => string;
  }> = ({ changeMdSource = v => v }) => {
    const source = useMemo(() => {
      return changeMdSource(md);
    }, [changeMdSource]);
    return <MarkdownRenderer md={source} />;
  };
  return WrappedDocComp;
}
