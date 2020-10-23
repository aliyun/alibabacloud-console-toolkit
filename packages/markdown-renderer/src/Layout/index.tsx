import React from "react";
import styled from "styled-components";
import TOC, { ITocHeading } from "./TableOfContent";

const Layout: React.FC<{
  ctnRef: React.Ref<HTMLDivElement>;
  headings: ITocHeading[];
}> = ({ children, ctnRef, headings }) => {
  // const { autoPadding = true, scrollContainer } = useDocMetaCtx()
  // const [padding, setPadding] = useState(0)
  // const paddingRef = useRef<HTMLDivElement | null>(null)

  // const { ctnRef, headings } = useTOC()

  // useEffect(() => {
  //   if (!autoPadding) return
  //   handle()
  //   window.addEventListener('resize', handle)

  //   return () => {
  //     window.removeEventListener('resize', handle)
  //   }
  //   function handle() {
  //     setPadding(getPadding())
  //   }
  //   function getPadding() {
  //     if (!headings || headings.length === 0) return 0
  //     const last = headings[headings.length - 1]
  //     const headingEl = document && document.getElementById(last.id)
  //     if (!headingEl) return 0
  //     const { viewportHeight, contentTopPos, contentHeight } = (() => {
  //       const parent =
  //         (scrollContainer && document.querySelector(scrollContainer)) ||
  //         getScrollParent(headingEl) ||
  //         window
  //       const currentPadding = paddingRef.current?.offsetHeight ?? 0
  //       // 滚动容器是window
  //       if ('document' in parent) {
  //         return {
  //           viewportHeight: document.documentElement.clientHeight,
  //           contentTopPos: document.documentElement.getBoundingClientRect().top,
  //           contentHeight:
  //             document.documentElement.scrollHeight - currentPadding,
  //         }
  //       }
  //       return {
  //         viewportHeight: parent.clientHeight,
  //         contentTopPos: parent.getBoundingClientRect().top - parent.scrollTop,
  //         contentHeight: parent.scrollHeight - currentPadding,
  //       }
  //     })()
  //     // 最后一个heading与文档顶部之间的滚动距离
  //     const offset = headingEl.getBoundingClientRect().top - contentTopPos
  //     return viewportHeight - (contentHeight - offset)
  //   }
  // }, [headings, autoPadding, scrollContainer])

  return (
    <ScLayout>
      <ScLayoutLeft>
        <ScDocStyle className="auto-padding-container">
          <div ref={ctnRef}>{children}</div>
          {/* {autoPadding && (
            <div
              className="auto-padding"
              style={{ height: padding }}
              ref={paddingRef}
            />
          )} */}
        </ScDocStyle>
      </ScLayoutLeft>
      {Array.isArray(headings) && headings.length > 0 && (
        <ScLayoutRight>
          <TOC headings={headings} />
        </ScLayoutRight>
      )}
    </ScLayout>
  );
};

export default Layout;

const ScLayout = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
`;

const ScLayoutLeft = styled.div`
  flex: 1 1 auto;
  /* https://stackoverflow.com/questions/43809612/prevent-a-child-element-from-overflowing-its-parent-in-flexbox */
  min-width: 0;
`;

const ScLayoutRight = styled.div`
  width: 280px;
  flex: 0 0 auto;
  max-height: 720px;
  overflow: auto;
  margin-left: 36px;
  margin-top: 28px;
  position: sticky;
  top: 12px;

  ::-webkit-scrollbar {
    width: 5px;
  }
  ::-webkit-scrollbar-track {
    background: #dedede;
  }
  ::-webkit-scrollbar-thumb {
    background: #666;
  }
`;

const ScDocStyle = styled.div`
  font-size: 14px;
  line-height: 1.67;
  color: #333333;

  /* 不要在这里随便用类选择器来选择文档元素，比如选择p元素。因为你可能选中demo中的p元素。 */
  /* 请在MarkdownComponents目录中定义文档元素的样式。 */

  figcaption {
    text-align: center;
    color: gray;
  }
`;
