'use strict'

const path = require('path')
const { rootPath: appDir } = require('electron-root-path')

let electronBuilderConfig = {}

try {
  electronBuilderConfig = require(path.join(appDir, 'electron-builder-config'))
} catch (err) {}

const productName = electronBuilderConfig
  ?.productName ?? 'Bitfinex Report'

module.exports = productName
