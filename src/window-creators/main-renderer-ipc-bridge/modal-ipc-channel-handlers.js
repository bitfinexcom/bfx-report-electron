'use strict'

const IpcChannelHandlers = require('./ipc.channel.handlers')
const { initClosedEventListener } = require('./helpers')

class ModalIpcChannelHandlers extends IpcChannelHandlers {
  static channelName = 'modal'

  static isModalClosedEventListenerInited = false
  static modalClosedEventHandlerSet = new Set()

  static onModalClosedEvent (cb) {
    return this.handleListener(this.onModalClosedEvent, cb)
  }

  static async sendFireModalEvent (win, args) {
    const {
      closedEventPromise,
      toastId
    } = initClosedEventListener({
      handlerSet: this.modalClosedEventHandlerSet,
      setInitFlagFn: (flag) => {
        this.isModalClosedEventListenerInited = flag
      },
      getInitFlagFn: () => this.isModalClosedEventListenerInited,
      onClosedEventFn: (cb) => {
        this.onModalClosedEvent(cb)
      }
    })

    this.sendToRenderer(this.sendFireModalEvent, win, {
      ...args,
      toastId
    })

    return await closedEventPromise
  }
}

module.exports = ModalIpcChannelHandlers
