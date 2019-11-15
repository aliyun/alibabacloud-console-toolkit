const _ = require('lodash')

class Store {
  constructor() {
    this._cache = {}
  }

  clear() {
    this._cache = {}
  }

  has(key) {
    return _.has(this._cache, key)
  }

  get(key) {
    return _.get(this._cache, key)
  }

  set(key, value) {
    _.set(this._cache, key, value)
  }
}

module.exports = Store
