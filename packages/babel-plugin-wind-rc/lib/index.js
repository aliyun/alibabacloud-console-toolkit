const _ = require('lodash')
const {
  isStringLiteral,
  importDeclaration,
  stringLiteral,
} = require('@babel/types')
const { declare } = require('@babel/helper-plugin-utils')

const REG_MATCH_PATTERN = /^@ali\/wind-rc-(?:[\w-]+)$/
const CSS_FILE_PATH = 'dist/index.css'

const transPatterns = patterns => {
  let result = patterns
  if (_.isRegExp(patterns)) {
    result = [patterns]
  }

  return result.filter(_.isRegExp)
}

const babelPluginWindRc = declare((api, options) => {
  api.assertVersion(7)

  const {
    includePatterns = [REG_MATCH_PATTERN],
    excludePatterns = [],
    cssFilePath = CSS_FILE_PATH,
  } = options

  const visitor = {
    ImportDeclaration(path) {
      const { source } = path.node
      if (!isStringLiteral(source)) {
        return
      }

      const { value: sourceValue } = source

      const exactExcludePatterns = transPatterns(excludePatterns)

      if (Array.isArray(exactExcludePatterns)) {
        for (const pattern of exactExcludePatterns) {
          if (pattern.test(sourceValue)) {
            return
          }
        }
      }

      const exactIncludePatterns = transPatterns(includePatterns)

      if (
        !Array.isArray(exactIncludePatterns) ||
        !exactIncludePatterns.length
      ) {
        console.warn(
          '[babel-plugin-wind-rc] ' +
          'It will be not importing related css files automatically, ' +
          'because the plugin cannot find any import sources ' +
          'that can be matched `includePatterns`.'
        )
        return
      }

      let canBeInject = false

      _.forEach(exactIncludePatterns, (pattern) => {
        if (pattern.test(sourceValue)) {
          canBeInject = true
        }
      })

      if (canBeInject) {
        path.insertBefore(
          importDeclaration(
            [],
            stringLiteral(`${sourceValue}/${cssFilePath}`)
          )
        )
      }
    },
  }

  return {
    name: 'babel-plugin-wind-rc',
    visitor,
  }
})

module.exports = babelPluginWindRc
