import React from "react";
import styled from "styled-components";
import HeaderWithAnchor from "./HeaderWithAnchor";

function getHeading(level) {
  return ({ children, id, className }) => {
    return (
      <HeaderWithAnchor
        className={mergeClsName(className, "cc-doc-toc")}
        level={level}
        id={id}
      >
        {children}
      </HeaderWithAnchor>
    );
  };
}

const shared = `
  font-weight: 600;
  line-height: 1.25;
  margin-bottom: 16px;
  margin-top: 24px;
  color: #181818;
  line-height: 30px;
`;

const headings = {
  heading: ({ level, ...rest }) => {
    switch (level) {
      case 1:
        return <headings.h1 {...(rest as any)} />;
      case 2:
        return <headings.h2 {...(rest as any)} />;
      case 3:
        return <headings.h3 {...(rest as any)} />;
      case 4:
        return <headings.h4 {...(rest as any)} />;
      case 5:
        return <headings.h5 {...(rest as any)} />;
      case 6:
        return <headings.h6 {...(rest as any)} />;
      default:
        break;
    }
  },
  h1: styled(getHeading(1))`
    ${shared};
    font-size: 2em;
    margin: 0.67em 0;
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.3em;
  `,
  h2: styled(getHeading(2))`
    ${shared};
    font-size: 24px;
    margin: 24px 0;
  `,
  h3: styled(getHeading(3))`
    ${shared};
    font-size: 18px;
    margin: 10px 0 5px;
  `,
  h4: styled(getHeading(4))`
    font-weight: bold;
  `,
  h5: styled(getHeading(5))`
    font-weight: bold;
  `,
  h6: styled(getHeading(6))`
    font-weight: bold;
  `
};

function mergeClsName(...clsNames) {
  return clsNames.filter(Boolean).join(" ");
}

export default headings;
