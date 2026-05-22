'use strict'

const parseUrl = require('./parse-url')

module.exports = (win, url) => {
  const parsedTargetUrl = parseUrl(url)
  const parsedCurrentUrl = parseUrl(win.webContents.getURL())

  if (
    parsedTargetUrl?.protocol !== 'http:' &&
    parsedTargetUrl?.protocol !== 'https:' &&
    parsedTargetUrl?.host === parsedCurrentUrl?.host
  ) {
    return false
  }

  return true
}
