import <%= upperCaseName %> from '../src/index'

describe('<%= upperCaseName %> #main', () => {
  it('exports in correct type', () => {
    [<%= upperCaseName %>].forEach((ReactComponent) => {
      expect(typeof ReactComponent).toBe('function')
    })
  })
})
