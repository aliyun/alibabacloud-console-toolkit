import React from 'react'
import { Button } from '@aliwind'

const Component = () => (<div></div>)

const MyComponent = () => (
  <Button
    component={Component}
    __async
  />
)

export default MyComponent
