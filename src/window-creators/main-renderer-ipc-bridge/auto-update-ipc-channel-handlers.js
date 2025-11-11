'use strict'

const { v4: uuidv4 } = require('uuid')

const IpcChannelHandlers = require('./ipc.channel.handlers')

class AutoUpdateIpcChannelHandlers extends IpcChannelHandlers {
  static channelName = 'autoUpdate'

  static isToastClosedEventListenerInited = false
  static toastClosedEventHandlerSet = new Set()

  static onToastClosedEvent (cb) {
    return this.handleListener(this.onToastClosedEvent, cb)
  }

  static async sendFireToastEvent (win, args) {
    // Sign toast with uuid for further identification
    const toastId = uuidv4()
    const toastClosedPromise = this.#initToastClosedEventListener(
      toastId
    )

    this.sendToRenderer(this.sendFireToastEvent, win, {
      ...args,
      toastId
    })

    return await toastClosedPromise
  }

  static sendProgressToastEvent (win, args) {
    return this.sendToRenderer(this.sendProgressToastEvent, win, args)
  }

  static #initToastClosedEventListener (toastId) {
    return new Promise((resolve, reject) => {
      const handler = (event, args) => {
        if (args?.toastId !== toastId) {
          return
        }
        if (args?.error) {
          // `args.error` can't be instance of Error
          reject(new Error(args.error))

          return
        }

        resolve(args)
      }
      this.toastClosedEventHandlerSet.add(handler)

      if (this.isToastClosedEventListenerInited) {
        return
      }

      this.isToastClosedEventListenerInited = true

      this.onToastClosedEvent((event, args) => {
        for (const handler of this.toastClosedEventHandlerSet) {
          this.toastClosedEventHandlerSet.delete(handler)
          handler(event, args)
        }
      })
    })
  }
}

module.exports = AutoUpdateIpcChannelHandlers
