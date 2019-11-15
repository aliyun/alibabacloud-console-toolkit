const { resolve } = require('path')
const { readFileSync } = require('fs-extra')
const { JSDOM } = require('jsdom')

const PLUGIN_NAME = '[webpack-plugin-html-skeleton]'

const injectFragment = (
  document,
  fragment,
  options = {}
) => {
  const {
    // The param `query` is deprecated. Using `container` instead of it.
    query,
    container,
    force = true,
  } = options

  if (query && !container) {
    console.warn(`${PLUGIN_NAME} The param 'query' is deprecated. Using 'container' instead of it.`)
  }

  const nodeQuery = container || query
  const node = document.querySelector(nodeQuery)
  if (!node) {
    console.warn(`${PLUGIN_NAME} Cannot find specific node '${nodeQuery}' from the DOM`)
    return
  }

  const originInnerHTML = node.innerHTML
  if (!force && originInnerHTML.trim().length > 0) {
    console.warn(
      `${PLUGIN_NAME} The node '${nodeQuery}' is not empty. ` +
      'The plugin will do not override the contents by default. ' +
      'You can set the \'option.force\' to `true` ' +
      'to overrides the original content.'
    )
    return
  }

  try {
    node.innerHTML = fragment || readFileSync(
      resolve(__dirname, './defaultTemplate.ejs'),
      { encoding: 'utf8' }
    )
  } catch (err) {
    console.warn(err)
  }
}

const defaultOptions = {
  container: '#app',
  force: true,
}

class HtmlSkeletonWebpackPlugin {
  constructor(options = {}) {
    this.options = Object.assign({}, defaultOptions, options)
  }

  apply(compiler) {
    // eslint-disable-next-line max-len
    compiler.hooks.compilation.tap('HtmlSkeletonWebpackPlugin', (compilation) => {
      compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(
        'HtmlSkeletonWebpackPlugin',
        (data, cb) => {
          const dom = new JSDOM(data.html)
          if (dom && dom.window && dom.window.document) {
            const doc = dom.window.document
            injectFragment(doc, this.options.fragment, this.options)
            // eslint-disable-next-line no-param-reassign
            data.html = dom.serialize()
          }
          cb(null, data)
        }
      )
    })
  }
}

module.exports = HtmlSkeletonWebpackPlugin
