import "include-foo/css/file/index.css";
import Foo from 'include-foo';
import "include-bar/css/file/index.css";
import Bar from 'include-bar';
import Baz from 'exclude-baz';

const MyComponent = () => <Foo>
    <Bar />
    <Baz />
  </Foo>;

export default MyComponent;