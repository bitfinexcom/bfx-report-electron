'use strict'

const {
  IpcMessageError,
  AppInitializationError
} = require('../../errors')

const {
  deserializeError
} = require('../../helpers/utils')

module.exports = (ipc) => {
  return new Promise((resolve, reject) => {
    try {
      const timeout = setTimeout(() => {
        rmHandler()
        reject(new AppInitializationError())
      }, 30 * 60 * 1000).unref()

      const rmHandler = () => {
        ipc.off('message', handler)
        clearTimeout(timeout)
      }
      const handler = (mess) => {
        if (
          mess ||
          typeof mess === 'object' ||
          typeof mess.err === 'string'
        ) {
          mess.err = deserializeError(mess.err)
        }

        const { state, err } = mess ?? {}

        if (typeof state !== 'string') {
          rmHandler()
          reject(new IpcMessageError())

          return
        }
        if (state === 'error:app-init') {
          rmHandler()
          reject(err || new AppInitializationError())

          return
        }
        if (state === 'ready:server') {
          rmHandler()
          resolve(mess)
        }
      }

      ipc.on('message', handler)
    } catch (err) {
      reject(err)
    }
  })
}
