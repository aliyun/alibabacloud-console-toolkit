import React from 'react'
import Component from 'react-component'
import { Button } from '@aliwind'

const MyComponent = () => (
  <Button
    type="primary"
    component={Component}
    __loading={() => (<div>123</div>)}
    __async
  />
)

export default MyComponent
