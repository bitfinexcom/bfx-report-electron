'use strict'

const path = require('path')
const { rootPath: appDir } = require('electron-root-path')

const electronBuilderJson = require(path.join(appDir, 'electron-builder.json'))
const productName = electronBuilderJson
  ?.productName ?? 'Bitfinex Report'

module.exports = productName
