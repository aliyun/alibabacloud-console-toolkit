import "include-foo/dist/index.css";
import Foo from 'include-foo';
import "include-bar/dist/index.css";
import Bar from 'include-bar';
import Baz from 'exclude-baz';

const MyComponent = () => <Foo>
    <Bar />
    <Baz />
  </Foo>;

export default MyComponent;