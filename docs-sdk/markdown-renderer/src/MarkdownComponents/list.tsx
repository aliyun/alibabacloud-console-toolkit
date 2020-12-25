import React from "react";
import styled from "styled-components";

const shared = `
  margin-bottom: 16px;
  margin-top: 0;
  padding-left: 2em;
  display: block;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  padding-inline-start: 40px;
`;

const LI = styled.li`
  word-wrap: break-all;
  & > p {
    margin-top: 16px;
  }
  & + & {
    margin-top: 0.25em;
  }
`;

const OL = styled.ol`
  ${shared};
  ${LI} {
    list-style: decimal;
  }
`;

const UL = styled.ul`
  ${shared};
  ${LI} {
    list-style: disc;
  }
`;

const lists = {
  list: ({ ordered, ...rest }) => {
    if (ordered) {
      return <lists.ol {...rest} />;
    }
    return <lists.ul {...rest} />;
  },
  listItem: LI,
  ul: UL,
  ol: OL,
  li: LI,
};

export default lists;
