import dep from 'dependency'
import { classDecorator, methodDecorator } from './decorator'

@classDecorator
class Foo {
  @methodDecorator
  bar() {
    return dep()
  }
}

export default Foo
