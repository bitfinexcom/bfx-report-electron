'use strict'

const debug = require('debug')
const config = require('config')

const prefix = config.has('logDebug.prefix')
  ? config.get('logDebug.prefix')
  : ''
const postfix = config.has('logDebug.postfix')
  ? config.get('logDebug.postfix')
  : ''

let _token = []

const infoToken = `${prefix}info${postfix}`
const devToken = `${prefix}dev${postfix}`
const errorToken = `${prefix}error${postfix}`

if (config.has('logDebug.enableInfo') && config.get('logDebug.enableInfo')) {
  _token.push(`${infoToken}`)
  _token.push(`${infoToken}:*`)
}

if (config.has('logDebug.enableDev') && config.get('logDebug.enableDev')) {
  _token.push(`${devToken}`)
  _token.push(`${devToken}:*`)
}

if (config.has('logDebug.enableError') && config.get('logDebug.enableError')) {
  _token.push(`${errorToken}`)
  _token.push(`${errorToken}:*`)
}

if (_token.length > 0) {
  debug.enable(_token.join(','))
}

const info = debug(infoToken)
const dev = debug(devToken)
const error = debug(errorToken)

info.log = console.info.bind(console)
dev.log = console.info.bind(console)
error.log = console.error.bind(console)

module.exports = {
  info,
  error,
  debug: dev
}
