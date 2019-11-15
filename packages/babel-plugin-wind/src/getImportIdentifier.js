const {
  isIdentifier,
  isImportDefaultSpecifier,
  isImportNamespaceSpecifier,
} = require('@babel/types')
const _ = require('lodash')

const getLocalName = (specifier) => {
  const { local } = specifier
  if (local && isIdentifier(local)) {
    return local.name
  }
}

const getImportedName = (specifier) => {
  const { imported } = specifier
  return (imported && isIdentifier(imported)) ?
    imported.name : getLocalName(specifier)
}

const getImportIdentifier = (specifiers) => {
  if (!specifiers) {
    return null
  }

  const initResult = {
    defaults: undefined,
    identifiers: [],
  }

  return _.reduce(specifiers, (result, specifier) => {
    if (isImportNamespaceSpecifier(specifier)) {
      return result
    }

    const localName = getLocalName(specifier)
    if (isImportDefaultSpecifier(specifier)) {
      return _.assign(result, {
        defaults: localName,
      })
    }

    const importedName = getImportedName(specifier)
    return _.assign(result, {
      identifiers: [
        ...result.identifiers,
        {
          importedName,
          localName,
        },
      ],
    })
  }, initResult)
}

module.exports = getImportIdentifier
