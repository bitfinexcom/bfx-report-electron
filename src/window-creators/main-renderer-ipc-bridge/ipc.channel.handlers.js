'use strict'

const { ipcMain } = require('electron')

class IpcChannelHandlers {
  constructor (channelName) {
    this.channelName = channelName ?? 'general'

    this.#setup()
  }

  static create () {
    return new this()
  }

  #setup () {
    const methodNames = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this)
    )
    methodNames.shift()

    for (const handlerName of methodNames) {
      if (!handlerName.endsWith('Handler')) {
        continue
      }

      const methodName = this.#getMethodName(handlerName)
      const eventName = this.#getEventName(methodName)

      ipcMain.handle(eventName, (event, args) => {
        return this[handlerName](event, args)
      })
    }
  }

  #getMethodName (handlerName) {
    return handlerName.replace(/Handler$/, '')
  }

  #getEventName (method) {
    return `${this.channelName}:${method}`
  }
}

module.exports = IpcChannelHandlers
