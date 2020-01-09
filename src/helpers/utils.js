'use strict'

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
  serializeError,
  deserializeError
}
