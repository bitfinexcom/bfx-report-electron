'use strict'

const { app } = require('electron')

const wins = require('../windows')
const IpcChannelHandlers = require('./ipc.channel.handlers')

class GeneralIpcChannelHandlers extends IpcChannelHandlers {
  async exitHandler (event, args) {
    return app.exit(args?.code ?? 0)
  }

  async getTitleHandler (event, args) {
    return wins.mainWindow.getTitle()
  }

  static onLoadingDescriptionReady (cb) {
    return this.handleListener(this.onLoadingDescriptionReady, cb)
  }

  static sendLoadingDescription (win, args) {
    return this.sendToRenderer(this.sendLoadingDescription, win, args)
  }
}

module.exports = GeneralIpcChannelHandlers
