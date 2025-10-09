'use strict'

const path = require('path')
const { promisify } = require('util')
const fs = require('fs')

const {
  InvalidFolderPathError
} = require('../errors')

const readdir = promisify(fs.readdir)
const unlink = promisify(fs.unlink)

const serializeError = (err) => {
  if (!(err instanceof Error)) {
    return err
  }

  return {
    toJSON () {
      return Object.keys(err).reduce((obj, key) => {
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

const rm = async (
  dir,
  {
    exclude = [],
    include = []
  }
) => {
  if (
    !dir ||
    typeof dir !== 'string' ||
    dir === '/'
  ) {
    throw new InvalidFolderPathError()
  }

  const files = await readdir(dir)
  const promisesArr = files.map(async (file) => {
    if (
      Array.isArray(exclude) &&
      exclude.some(exFile => exFile === file)
    ) {
      return
    }
    if (
      Array.isArray(include) &&
      include.every(inFile => inFile !== file)
    ) {
      return
    }

    return unlink(path.join(dir, file))
  })

  return Promise.all(promisesArr)
}

const getServerPromise = (srv, port) => {
  return new Promise((resolve, reject) => {
    srv.once('error', (err) => {
      srv.removeListener('listening', resolve)
      reject(err)
    })
    srv.once('listening', () => {
      srv.removeListener('error', reject)
      resolve()
    })
    srv.listen(port)
  })
}

const initIpcChannelHandlers = (...ipcChannelHandlersList) => {
  for (const IpcChannelHandlers of ipcChannelHandlersList) {
    IpcChannelHandlers.create()
  }
}

module.exports = {
  serializeError,
  deserializeError,
  rm,
  getServerPromise,
  initIpcChannelHandlers
}
