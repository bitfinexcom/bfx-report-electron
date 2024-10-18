'use strict'

const { app } = require('electron')

const productName = require('./product-name')

module.exports = () => {
  return app.getPath('userData')
    .replace('bfx-report-electron', productName)
}
