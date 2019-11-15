const _ = require('lodash')
const { transformFileSync } = require('@babel/core')
const transformRuntime = require('@babel/plugin-transform-runtime')
const syntaxJsx= require('@babel/plugin-syntax-jsx')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const babelPluginWindRc = require('../lib')

const getBabelOptions = (pluginOptions = {}) => ({
  generatorOpts: {
    quotes: 'single',
  },
  plugins: [
    syntaxJsx,
    transformRuntime,
    [babelPluginWindRc, pluginOptions],
  ],
})

const getTestName = (testPath) => path.basename(testPath).split('-').join(' ')

const getSubFixtures = (name) => {
  const testPaths = glob.sync(
    path.resolve(__dirname, `${name}/*/`)
  )

  return _.map(testPaths, (testPath) => {
    const testName = getTestName(testPath)
    const actualPath = path.resolve(testPath, 'actual.js')
    const expectedPath = path.resolve(testPath, 'expected.js')

    return {
      baseName: path.basename(testPath),
      testName,
      actualPath,
      expectedPath,
    }
  })
}

const mockedPluginOptions = {
  includePatterns: [
    /^include-foo$/,
    /^include-bar$/,
    /^include-baz$/,
  ],
  excludePatterns: [
    /^include-bar$/,
    /^exclude-foo$/,
    /^exclude-bar$/,
    /^exclude-baz$/,
  ],
  cssFilePath: 'css/file/index.css',
}

describe('cherry-pick module', () => {
  _.each(getSubFixtures('fixtures'), ({ baseName, testName, actualPath, expectedPath }) => {
    test(testName, () => {
      const expected = fs.readFileSync(expectedPath, 'utf8')
      let pluginOptions = {}

      switch (baseName) {
        case 'option-include-patterns':
          pluginOptions = _.pick(mockedPluginOptions, ['includePatterns'])
          break
        case 'option-exclude-patterns':
          pluginOptions = _.pick(mockedPluginOptions, ['excludePatterns'])
          break
        case 'option-css-file-path':
          pluginOptions = _.pick(mockedPluginOptions, ['includePatterns', 'cssFilePath'])
          break
        case 'with-options':
          pluginOptions = mockedPluginOptions
          break
        default:
          break
      }

      const actual = transformFileSync(
        actualPath,
        getBabelOptions(pluginOptions)
      ).code

      expect(_.trim(expected)).toEqual(_.trim(actual))
    })
  })
})
