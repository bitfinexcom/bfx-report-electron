'use strict'

const { app } = require('electron')

const wins = require('../windows')
const IpcChannelHandlers = require('./ipc.channel.handlers')

class GeneralIpcChannelHandlers extends IpcChannelHandlers {
  #hideLoadingWindow = null

  constructor (...args) {
    super(...args)

    // Resolve circular dependency issue
    this.#hideLoadingWindow = require(
      '../change-loading-win-visibility-state'
    ).hideLoadingWindow
  }

  async exitHandler (event, args) {
    return app.exit(args?.code ?? 0)
  }

  async hideLoadingWindowHandler (event, args) {
    await this.#hideLoadingWindow()
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
