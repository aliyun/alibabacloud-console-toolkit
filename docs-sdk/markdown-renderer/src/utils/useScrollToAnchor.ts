import { useCallback, useState } from "react";

export function useScrollToAnchor(ctnRef: React.RefObject<HTMLDivElement>) {
  // 当成功加载内部微应用的时候，根据url hash，滚动到对应的元素
  const [alreadyScrollToHashAnchor, setAlreadyScrollToHashAnchor] = useState(
    false
  );
  const scrollToAnchor = useCallback(() => {
    if (!ctnRef.current) return;
    if (alreadyScrollToHashAnchor) return;
    const hash = window.location.hash;
    const el = ctnRef.current.querySelector(hash);
    if (el) {
      setAlreadyScrollToHashAnchor(true);
      window.location.hash = "#";
      window.location.hash = hash;
      // el.scrollIntoView({
      //   behavior: "smooth",
      // });
    }
  }, [alreadyScrollToHashAnchor]);
  return scrollToAnchor;
}
