import _regeneratorRuntime from "__DIRNAME__/node_modules/@babel/runtime/regenerator";

var foo =
/*#__PURE__*/
_regeneratorRuntime.mark(function foo() {
  var _baz;

  return _regeneratorRuntime.wrap(function foo$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return bar();

        case 2:
          _context.next = 4;
          return baz();

        case 4:
          _baz = _context.sent;
          _context.next = 7;
          return qux(_baz);

        case 7:
          return _context.abrupt("return", _context.sent);

        case 8:
        case "end":
          return _context.stop();
      }
    }
  }, foo);
});