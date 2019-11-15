const foo = function* () {
  yield bar()
  const _baz = yield baz()
  return yield qux(_baz)
}
