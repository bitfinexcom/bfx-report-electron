'use strict'

const IpcChannelHandlers = require('./ipc.channel.handlers')

class AutoUpdateIpcChannelHandlers extends IpcChannelHandlers {
  static channelName = 'autoUpdate'

  static sendFireToastEvent (win, args) {
    return this.sendToRenderer(this.sendFireToastEvent, win, args)
  }

  static sendProgressToastEvent (win, args) {
    return this.sendToRenderer(this.sendProgressToastEvent, win, args)
  }
}

module.exports = AutoUpdateIpcChannelHandlers
