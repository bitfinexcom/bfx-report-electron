'use strict'

const {
  getFreePort,
  getDefaultPorts
} = require('./ports')
const {
  serializeError,
  deserializeError,
  rm
} = require('./utils')
const isMainWinAvailable = require(
  './is-main-win-available'
)
const productName = require('./product-name')
const getAlertCustomClassObj = require('./get-alert-custom-class-obj')

module.exports = {
  getFreePort,
  getDefaultPorts,
  serializeError,
  deserializeError,
  rm,
  isMainWinAvailable,
  productName,
  getAlertCustomClassObj
}
