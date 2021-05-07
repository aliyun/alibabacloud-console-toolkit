import React from "react";
import {
  markdownComponents,
  MarkdownRenderer,
} from "@alicloud/console-toolkit-markdown-renderer";

interface IProps {
  typeInfo: InterfaceInfo;
}

interface InterfaceInfo {
  name: string;
  documentation: string;
  properties: InterfacePropertyInfo[];
}

interface InterfacePropertyInfo {
  name: string;
  typeText: string;
  documentation: string;
  defaultValue?: string;
}

const compactMarkdownComponents = {
  p: (props) => <p style={{ margin: 0, ...props.style }} {...props} />,
  ul: (props) => <ul {...props} />,
  ol: (props) => <ol {...props} />,
  li: (props) => <li {...props} />,
};

const InterfaceType: React.FC<IProps> = ({ typeInfo }) => {
  // typeInfo.properties
  return (
    <div>
      <markdownComponents.table>
        <colgroup>
          <col span={1} style={{ width: "15%" }} />
          <col span={1} style={{ width: "15%" }} />
          <col span={1} style={{ width: "60%" }} />
          <col span={1} style={{ width: "10%" }} />
        </colgroup>
        <markdownComponents.thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>说明</th>
            <th>默认值</th>
          </tr>
        </markdownComponents.thead>
        <markdownComponents.tbody>
          {typeInfo.properties.map((property, idx) => {
            return (
              <tr key={idx}>
                <td>{property.name}</td>
                <td>
                  <markdownComponents.inlinecode>
                    {property.typeText}
                  </markdownComponents.inlinecode>
                </td>
                <td>
                  <MarkdownRenderer
                    source={property.documentation}
                    components={compactMarkdownComponents}
                  />
                </td>
                <td>
                  {property.defaultValue && (
                    <markdownComponents.inlinecode>
                      {property.defaultValue}
                    </markdownComponents.inlinecode>
                  )}
                </td>
              </tr>
            );
          })}
        </markdownComponents.tbody>
      </markdownComponents.table>
    </div>
  );
};

export default InterfaceType;
