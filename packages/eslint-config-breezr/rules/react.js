module.exports = {
  'react/sort-comp': [1, {
    order: [
      'displayName',
      'propTypes',
      'defaultProps',
      'childContextTypes',
      'static-methods',
      'state',
      'instance-variables',
      'instance-methods',
      'everything-else',
      'lifecycle',
      'render',
      '/^_?render.+$/'
    ]
  }]
};
