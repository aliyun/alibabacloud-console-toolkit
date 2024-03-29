import styled from "styled-components";
import heading from "./heading";
import code from "./code";
import list from "./list";
import table from "./table";
import anchor from "./anchor";

// 模仿github渲染markdown的样式
// 样式参考 https://github.com/sindresorhus/github-markdown-css/blob/gh-pages/github-markdown.css

const Paragraph = styled.p`
  margin: 12px 0;
  padding: 0;
  font-size: 14px;
  line-height: 2;
  color: #333333;
  > img {
    display: block;
    max-width: 80%;
    max-height: 500px;
    margin: 20px auto;
    cursor: pointer;
  }
`;

const Blockquote = styled.blockquote`
  border-left: 5px solid #c9c9c9;
  margin: 10px 0;
  padding: 1px 20px;
  line-height: 1.67;
  color: #d3d3d3;
  > p {
    margin: 10px 0;
    color: #999999;
  }
`;

const HR = styled.hr`
  box-sizing: content-box;
  background: transparent;
  border-bottom: 1px solid #dfe2e5;
  overflow: hidden;
  background-color: #e1e4e8;
  border: 0;
  height: 0.25em;
  margin: 24px 0;
  padding: 0;
  border-bottom-color: #eee;

  &:before {
    content: "";
    display: table;
  }
  &:after {
    clear: both;
    content: "";
    display: table;
  }
`;

const Image = styled.img`
  max-width: 100%;
`;

export default {
  paragraph: Paragraph,
  p: Paragraph,
  blockquote: Blockquote,
  thematicBreak: HR,
  img: Image,
  ...heading,
  ...code,
  ...list,
  ...table,
  ...anchor
};
