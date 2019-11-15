const foo = async () => {
  await bar()
  const _baz = await baz()
  return _baz + 1
}
