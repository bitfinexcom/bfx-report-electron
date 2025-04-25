'use strict'

const { app } = require('electron')

const wins = require('../windows')
const IpcChannelHandlers = require('./ipc.channel.handlers')

class GeneralIpcChannelHandlers extends IpcChannelHandlers {
  async exitHandler (event, args) {
    return app.exit(args?.code ?? 0)
  }

  async minimizeLoadingWindowHandler (event, args) {
    await wins.loadingWindow?.minimize()
  }

  async closeLoadingWindowHandler (event, args) {
    await wins.loadingWindow?.close()
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

  static sendLoadingBtnStates (win, args) {
    return this.sendToRenderer(this.sendLoadingBtnStates, win, args)
  }
}

module.exports = GeneralIpcChannelHandlers
