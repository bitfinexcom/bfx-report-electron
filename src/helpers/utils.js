'use strict'

const fs = require('fs')

const checkAndChangeAccess = (path) => {
  try {
    fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK)
  } catch (err) {
    fs.chmodSync(path, '766')
  }
}

const serializeError = (err) => {
  if (!(err instanceof Error)) {
    return err
  }

  return {
    toJSON () {
      return Object.keys(err).reduce((obj, key) => {
        console.log('[key]:', key)
        obj[key] = err[key]

        return obj
      }, {
        name: err.name,
        message: err.message,
        stack: err.stack,
        isError: true
      })
    }
  }
}

module.exports = {
  checkAndChangeAccess,
  serializeError
}
