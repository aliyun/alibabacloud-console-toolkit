import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _applyDecoratedDescriptor from "@babel/runtime/helpers/esm/applyDecoratedDescriptor";

var _class, _class2;

import dep from 'dependency';
import { classDecorator, methodDecorator } from './decorator';

var Foo = classDecorator(_class = (_class2 =
/*#__PURE__*/
function () {
  function Foo() {
    _classCallCheck(this, Foo);
  }

  _createClass(Foo, [{
    key: "bar",
    value: function bar() {
      return dep();
    }
  }]);

  return Foo;
}(), (_applyDecoratedDescriptor(_class2.prototype, "bar", [methodDecorator], Object.getOwnPropertyDescriptor(_class2.prototype, "bar"), _class2.prototype)), _class2)) || _class;

export default Foo;