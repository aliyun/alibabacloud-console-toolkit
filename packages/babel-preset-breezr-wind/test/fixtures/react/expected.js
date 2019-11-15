import React, { Component } from 'react'
import PropTypes from 'prop-types'

class StatefulComponent extends Component {
  static propTypes = {
    author: PropTypes.string,
  }

  static defaultProps = {
    author: 'xingda',
  }

  state = {
    content: 'Hello'
  }

  componentDidMount() {
    this.setState((prevState) => ({
      content: prevState.content + ', world.'
    }))
  }

  render() {
    return (
      <>
        <h1>Stateful Component</h1>
        <address>{this.props.author}</address>
        <section>{this.state.content}</section>
      </>
    )
  }
}

export default StatefulComponent
