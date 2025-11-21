'use strict'

const { ipcMain } = require('electron')

class IpcChannelHandlers {
  static channelName = 'general'

  constructor () {
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
      const eventName = this.constructor.getEventName(methodName)

      ipcMain.handle(eventName, (event, args) => {
        return this[handlerName](event, args)
      })
    }
  }

  #getMethodName (handlerName) {
    return handlerName.replace(/Handler$/, '')
  }

  static getEventName (method) {
    return `${this.channelName}:${method}`
  }

  static handleListener (method, cb) {
    const methodName = typeof method === 'function'
      ? method.name.replace(/^on/, 'send')
      : method
    const eventName = this.getEventName(methodName)

    if (typeof cb === 'function') {
      return ipcMain.on(eventName, (e, args) => cb(e, args))
    }

    return new Promise((resolve) => {
      ipcMain.once(eventName, (e, args) => resolve({ ...args, event: e }))
    })
  }

  static sendToRenderer (method, win, args) {
    const methodName = typeof method === 'function'
      ? method.name.replace(/^send/, 'on')
      : method
    const eventName = this.getEventName(methodName)

    if (
      !win?.webContents ||
      win?.webContents?.isDestroyed()) {
      return
    }

    return win.webContents.send(eventName, args)
  }
}

module.exports = IpcChannelHandlers
