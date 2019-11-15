const _ = require('lodash')
const { isStringLiteral } = require('@babel/types')
const { declare } = require('@babel/helper-plugin-utils')
const Cache = require('./Cache')
const ImportCollection = require('./ImportCollection')
const getImportIdentifier = require('./getImportIdentifier')

const defaultOptions = {
  library: '@aliwind',
  cwd: 'lib',
}

const babelPluginWind = declare((api, options = {}) => {
  api.assertVersion(7)

  const { library, cwd, transformSource } = _.assign(
    {}, defaultOptions, options
  )
  const cache = new Cache()
  const importCollection = new ImportCollection()

  importCollection.hook({
    beforeImportParticleAdd({ source } = {}) {
      if (cache.has(source)) {
        return false
      }
      cache.set(source, true)
      return true
    },
  })

  const visitor = {
    Program: {
      enter() {
        cache.clear()
        importCollection.clear()
      },
      exit(path) {
        importCollection.generate(path)
      },
    },
    ImportDeclaration(path) {
      importCollection.clear()

      const { source, specifiers } = path.node

      if (!isStringLiteral(source)) {
        return
      }

      const { value: sourceValue } = source
      cache.set(sourceValue, true)

      if (sourceValue === library) {
        const importIdentifier = getImportIdentifier(specifiers)
        if (!_.isPlainObject(importIdentifier)) {
          return
        }

        const {
          defaults,
          identifiers,
        } = importIdentifier

        if (defaults || !identifiers || !identifiers.length) {
          return
        }
        _.each(identifiers, (identifier) => {
          const { importedName, localName } = identifier
          const item = {
            originSource: sourceValue,
            localName,
            importedName,
            cwd,
          }

          importCollection.add(item, { transformSource })
        })

        path.replaceWithMultiple(importCollection.generate())
      }
    },
  }

  return {
    name: 'wind',
    visitor,
  }
})

module.exports = babelPluginWind
