const _ = require('lodash')

const isEmptyString = (value) => (
  _.isString(value) && _.trim(value).length === 0
)

const isNilOrEmptyString = (value) => (
  _.isNil(value) || isEmptyString(value)
)

const isNotEmptyString = (value) => !isNilOrEmptyString(value)

module.exports = {
  isEmptyString,
  isNilOrEmptyString,
  isNotEmptyString,
}
