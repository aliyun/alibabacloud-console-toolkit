import React, { useEffect, useRef, useState, useCallback } from "react";
import debounce from "lodash.debounce";
import isequal from "lodash.isequal";
import { ITocHeading } from "../Layout/TableOfContent";

export function useTOC(enable = false, ctnRef: React.RefObject<HTMLDivElement>) {
  const [headings, setHeadings] = useState<ITocHeading[]>([]);

  const check = useCallback(
    debounce(() => {
      if (!ctnRef.current || !enable) return;
      const headingEls: HTMLElement[] = Array.from(
        ctnRef.current.querySelectorAll(".cc-doc-toc")
      );
      setHeadings(oldHeadings => {
        const newHeadings = headingEls.reduce<ITocHeading[]>((acc, el) => {
          const match = /h(\d)/i.exec(el.tagName || el.nodeName);
          if (match && el.textContent && el.id) {
            acc.push({
              depth: Number(match[1]),
              id: el.id,
              text: el.textContent
            });
          }
          return acc;
        }, []);
        // 避免无限重刷
        if (isequal(newHeadings, oldHeadings)) return oldHeadings;
        return newHeadings;
      });
    }, 100),
    [enable]
  );

  useEffect(() => {
    if (enable) check();
  });
  // 通过MutationObserver来监听子元素的变化，调用check
  // 可能会有性能问题，暂时用useEffect
  // useEffect(() => {
  //   const observer = new MutationObserver((mutList) => {
  //     mutList.forEach((mut) => {
  //       if (mut.type === 'childList') {
  //         const needCheck = Array.from(mut.addedNodes)
  //           .concat(Array.from(mut.removedNodes))
  //           .some((node) => {
  //             if (
  //               node instanceof HTMLElement &&
  //               (node.className.includes('cc-doc-toc') ||
  //                 node.querySelector('.cc-doc-toc'))
  //             )
  //               return true
  //             return false
  //           })
  //         if (needCheck) check()
  //       }
  //     })
  //   })
  //   observer.observe(ctnRef.current!, { childList: true, subtree: true })
  //   check()
  // }, [])

  return { ctnRef, headings, check };
}
