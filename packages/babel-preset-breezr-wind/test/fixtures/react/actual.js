import _classCallCheck from "__DIRNAME__/node_modules/@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "__DIRNAME__/node_modules/@babel/runtime/helpers/esm/createClass";
import _possibleConstructorReturn from "__DIRNAME__/node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn";
import _getPrototypeOf from "__DIRNAME__/node_modules/@babel/runtime/helpers/esm/getPrototypeOf";
import _inherits from "__DIRNAME__/node_modules/@babel/runtime/helpers/esm/inherits";
var _jsxFileName = "__DIRNAME__/test/fixtures/react/expected.js";
import React, { Component } from 'react';
import PropTypes from 'prop-types';

var StatefulComponent =
/*#__PURE__*/
function (_Component) {
  _inherits(StatefulComponent, _Component);

  function StatefulComponent() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, StatefulComponent);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(StatefulComponent)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _this.state = {
      content: 'Hello'
    };
    return _this;
  }

  _createClass(StatefulComponent, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.setState(function (prevState) {
        return {
          content: prevState.content + ', world.'
        };
      });
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(React.Fragment, null, React.createElement("h1", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 26
        },
        __self: this
      }, "Stateful Component"), React.createElement("address", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 27
        },
        __self: this
      }, this.props.author), React.createElement("section", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 28
        },
        __self: this
      }, this.state.content));
    }
  }]);

  return StatefulComponent;
}(Component);

StatefulComponent.propTypes = {
  author: PropTypes.string
};
StatefulComponent.defaultProps = {
  author: 'xingda'
};
export default StatefulComponent;
