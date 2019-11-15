import Foo from 'include-foo';
import Bar from 'include-bar';
import Baz from 'exclude-baz';

const MyComponent = () => <Foo>
    <Bar />
    <Baz />
  </Foo>;

export default MyComponent;