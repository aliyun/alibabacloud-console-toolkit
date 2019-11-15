import React from 'react'
import Component from 'react-component'
import Loadable from 'react-loadable'
import { Button } from '@aliwind'

const MyComponent = () => (
  <Button
    component={Component}
    __loading={() => (<div>123</div>)}
    __async
  />
)

export default MyComponent
