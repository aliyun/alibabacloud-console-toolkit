const _ = require('lodash')
const { transformFileSync } = require('@babel/core')
const transformRuntime = require('@babel/plugin-transform-runtime')
const syntaxJsx= require('@babel/plugin-syntax-jsx')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const babelPluginWind = require('../src')

const opts = {
  generatorOpts: {
    quotes: 'single',
  },
  plugins: [
    syntaxJsx,
    transformRuntime,
    babelPluginWind
  ]
}

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
      testName,
      actualPath,
      expectedPath,
    }
  })
}

describe('cherry-pick module', () => {
  _.each(getSubFixtures('fixtures'), ({ testName, actualPath, expectedPath }) => {
    test(testName, () => {
      const expected = fs.readFileSync(expectedPath, 'utf8')
      const actual = transformFileSync(actualPath, opts).code
      expect(_.trim(expected)).toEqual(_.trim(actual))
    })
  })
})
