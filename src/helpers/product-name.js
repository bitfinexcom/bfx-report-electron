'use strict'

const path = require('path')

const { rootPath } = require('./root-path')

let electronBuilderConfig = {}

try {
  electronBuilderConfig = require(path.join(rootPath, 'electron-builder-config'))
} catch (err) {}

const productName = electronBuilderConfig
  ?.productName ?? 'Bitfinex Report'

module.exports = productName
