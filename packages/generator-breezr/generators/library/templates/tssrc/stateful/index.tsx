import * as React from 'react'
import './index.less'

interface State {

}

interface Props {

}

class <%= upperCaseName %> extends React.Component<Props, State> {
  static defaultProps = {}

  state = {}

  render() {
    return (
      <div><%= upperCaseName %></div>
    )
  }
}

export default <%= upperCaseName %>
