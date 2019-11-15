const _ = require('lodash')
const {
  importDeclaration,
  importDefaultSpecifier,
  stringLiteral,
  identifier,
} = require('@babel/types')
const { isNotEmptyString } = require('./validator')

const defaultTransformSource = (originSource, importedName, cwd) => {
  const moduleDirname = _.kebabCase(importedName)
  const sources = [originSource, cwd, moduleDirname]
  return sources.filter(isNotEmptyString).join('/')
}

const getImportOptions = ({
  originSource,
  localName,
  importedName,
  cwd,
}, {
  transformSource = defaultTransformSource,
} = {}) => {
  const transformer = _.isFunction(transformSource) ?
    transformSource : defaultTransformSource
  const source = transformer(originSource, importedName, cwd)

  return {
    source,
    name: localName,
  }
}

const defaultHook = {
  beforeAdd: null,
  afterAdd: null,
  beforeGenerate: null,
  afterGenerate: null,
  beforeImportParticleAdd: null,
  afterImportParticleAdd: null,
}

class ImportCollection {
  constructor() {
    this._collection = null
    this._hook = null

    this._init()
  }

  _initCollection() {
    this._collection = []
  }

  _initHook() {
    this._hook = defaultHook
  }

  _init() {
    this._initCollection()
    this._initHook()
  }

  hook(hookDefination = {}) {
    this._hook = _.assign(this._hook, hookDefination)
  }

  removeHook(name) {
    if (_.isUndefined(name)) {
      this._initHook()
    }

    if (_.isString(name) && _.has(this._hook, name)) {
      Reflect.deleteProperty(this._hook, name);
    }
  }

  add(item, options) {
    const { beforeAdd, afterAdd } = this._hook
    const importOptions = getImportOptions(item, options)

    const canBeAdd = _.isFunction(beforeAdd) ?
      beforeAdd(item, importOptions) !== false : true

    if (!canBeAdd) {
      return
    }

    this._collection.push(importOptions)
    _.isFunction(afterAdd) && afterAdd(item)
  }

  addImports() {
    const {
      beforeImportParticleAdd,
      afterImportParticleAdd,
    } = this._hook

    const addedImports = []
    _.each(this._collection, (importOptions) => {
      const canBeAddImport = _.isFunction(beforeImportParticleAdd) ?
        beforeImportParticleAdd(importOptions) !== false : true

      if (!canBeAddImport) {
        return
      }

      const { source, name } = importOptions

      const declaration = importDeclaration(
        [importDefaultSpecifier(identifier(name))],
        stringLiteral(source)
      )

      addedImports.push(declaration)
      if (_.isFunction(afterImportParticleAdd)) {
        afterImportParticleAdd(importOptions, source, name)
      }
    })

    return addedImports
  }

  generate() {
    const {
      beforeGenerate,
      afterGenerate,
    } = this._hook

    const canBeGenerate = _.isFunction(beforeGenerate) ?
      beforeGenerate() !== false : true

    if (!canBeGenerate) {
      return
    }

    const result = this.addImports()
    _.isFunction(afterGenerate) && afterGenerate()

    return result
  }

  clear() {
    this._initCollection()
  }

  reset() {
    this._init()
  }
}

module.exports = ImportCollection
