const Filters = {
  notNil: item => !!item,
}

const filterBy = (arr, ...filters) => arr.filter(
  (item, i) => {
    for (const filter of filters) {
      if (!filter(item, i)) {
        return false
      }
    }
    return true
  }
)

const filterNotNil = arr => filterBy(arr, Filters.notNil)

exports.Filters = Filters
exports.filterBy = filterBy
exports.filterNotNil = filterNotNil

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

const forOwn = (obj, fn) => {
  for (const key in obj) {
    if (has(obj, key)) {
      fn(obj[key], key)
    }
  }
}

exports.has = has
exports.forOwn = forOwn
