import * as React from 'react'
import './index.less'

interface Props {
}

class <%= upperCaseName %> extends React.PureComponent<Props> {
  static defaultProps = {}

  render() {
    return (
      <div><%= upperCaseName %></div>
    )
  }
}

export default <%= upperCaseName %>
