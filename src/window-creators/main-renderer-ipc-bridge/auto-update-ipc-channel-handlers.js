'use strict'

const IpcChannelHandlers = require('./ipc.channel.handlers')
const { initClosedEventListener } = require('./helpers')

class AutoUpdateIpcChannelHandlers extends IpcChannelHandlers {
  static channelName = 'autoUpdate'

  static isToastClosedEventListenerInited = false
  static toastClosedEventHandlerSet = new Set()

  static onToastClosedEvent (cb) {
    return this.handleListener(this.onToastClosedEvent, cb)
  }

  static async sendFireToastEvent (win, args) {
    const {
      closedEventPromise,
      toastId
    } = initClosedEventListener({
      handlerSet: this.toastClosedEventHandlerSet,
      setInitFlagFn: (flag) => {
        this.isToastClosedEventListenerInited = flag
      },
      getInitFlagFn: () => this.isToastClosedEventListenerInited,
      onClosedEventFn: (cb) => {
        this.onToastClosedEvent(cb)
      }
    })

    this.sendToRenderer(this.sendFireToastEvent, win, {
      ...args,
      toastId
    })

    return await closedEventPromise
  }

  static sendProgressToastEvent (win, args) {
    return this.sendToRenderer(this.sendProgressToastEvent, win, args)
  }
}

module.exports = AutoUpdateIpcChannelHandlers
