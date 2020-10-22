import styled from "styled-components";

const table = styled.table`
  width: 100%;
  background: #ffffff;
  border-spacing: 0;
  margin: 20px 0;
  border-top: 1px solid #e3e3e3;
  border-left: 1px solid #e3e3e3;
`;

const tableHead = styled.thead`
  th {
    font-weight: bold;
    background: #f7f7f7;
    color: #181818;
    font-size: 14px;
    line-height: 20px;
    padding: 10px;
    border-bottom: 1px solid #e3e3e3;
    border-right: 1px solid #e3e3e3;
    text-align: left;
  }
`;

const tableBody = styled.tbody`
  td {
    padding: 10px;
    color: #181818;
    font-size: 14px;
    line-height: 1.67;
    border-bottom: 1px solid #e3e3e3;
    border-right: 1px solid #e3e3e3;
    text-align: left;
    min-width: 100px;
  }
`;

export default {
  table,
  tableHead,
  thead: tableHead,
  tableBody,
  tbody: tableBody
};
