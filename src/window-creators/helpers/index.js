'use strict'

const parseUrl = require('./parse-url')
const shouldUrlBeOpened = require('./should-url-be-opened')
const setWinFullScreenAndMaximize = require(
  './set-win-full-screen-and-maximize'
)

module.exports = {
  parseUrl,
  shouldUrlBeOpened,
  setWinFullScreenAndMaximize
}
