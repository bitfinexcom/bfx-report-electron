'use strict'

const { app } = require('electron')

const wins = require('../windows')
const WINDOW_NAMES = require('../window.names')
const IpcChannelHandlers = require('./ipc.channel.handlers')

class GeneralIpcChannelHandlers extends IpcChannelHandlers {
  async exitHandler (event, args) {
    return app.exit(args?.code ?? 0)
  }

  async getTitleHandler (event, args) {
    return wins[WINDOW_NAMES.MAIN_WINDOW].getTitle()
  }

  async minimizeLoadingWindowHandler (event, args) {
    await wins[WINDOW_NAMES.LOADING_WINDOW]?.minimize()
  }

  async closeLoadingWindowHandler (event, args) {
    await wins[WINDOW_NAMES.LOADING_WINDOW]?.close()
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

  async minimizeStartupLoadingWindowHandler (event, args) {
    await wins[WINDOW_NAMES.STARTUP_LOADING_WINDOW]?.minimize()
  }

  async closeStartupLoadingWindowHandler (event, args) {
    await wins[WINDOW_NAMES.STARTUP_LOADING_WINDOW]?.close()
  }

  static onStartupLoadingDescriptionReady (cb) {
    return this.handleListener(this.onStartupLoadingDescriptionReady, cb)
  }

  static sendStartupLoadingDescription (win, args) {
    return this.sendToRenderer(this.sendStartupLoadingDescription, win, args)
  }

  static sendStartupLoadingBtnStates (win, args) {
    return this.sendToRenderer(this.sendStartupLoadingBtnStates, win, args)
  }
}

module.exports = GeneralIpcChannelHandlers
