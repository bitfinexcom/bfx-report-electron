'use strict'

const { app } = require('electron')
const i18next = require('i18next')
const IpcChannelHandlers = require('./ipc.channel.handlers')

class TranslationIpcChannelHandlers extends IpcChannelHandlers {
  constructor () {
    super('translations')
  }

  // TODO:
  async getDefaultLanguageHandler (event, args) {
    const availableDefaultLanguages = [
      ...app.getPreferredSystemLanguages(),
      app.getLocale(),
      'en'
    ]

    return availableDefaultLanguages
  }

  async getAvailableLanguagesHandler (event, args) {
    return i18next.options.preload
  }
}

module.exports = TranslationIpcChannelHandlers
