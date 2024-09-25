'use strict'

const { app } = require('electron')
const IpcChannelHandlers = require('./ipc.channel.handlers')

class TranslationIpcChannelHandlers extends IpcChannelHandlers {
  constructor () {
    super('translations')
  }

  async getDefaultLangHandler (event, args) {
    return app.getPreferredSystemLanguages()
  }
}

module.exports = TranslationIpcChannelHandlers
