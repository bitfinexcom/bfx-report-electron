'use strict'

const path = require('path')
const { rootPath: appDir } = require('electron-root-path')

const packageJson = require(path.join(appDir, 'package.json'))
const productName = packageJson?.build?.productName
  ?? "Bitfinex Report"

module.exports = productName
