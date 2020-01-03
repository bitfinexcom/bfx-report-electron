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

const deserializeError = (err) => {
  if (
    !err ||
    typeof err !== 'object' ||
    !err.isError
  ) {
    return err
  }

  return Object.keys(err).reduce((error, key) => {
    error[key] = err[key]

    return error
  }, new Error())
}

module.exports = {
  checkAndChangeAccess,
  serializeError,
  deserializeError
}
