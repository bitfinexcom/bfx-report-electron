'use strict'

const { app } = require('electron')
const i18next = require('i18next')
const IpcChannelHandlers = require('./ipc.channel.handlers')
const { getConfigsKeeperByName } = require('../../configs-keeper')

class TranslationIpcChannelHandlers extends IpcChannelHandlers {
  constructor () {
    super('translations')

    this.configsKeeper = getConfigsKeeperByName('main')
  }

  async setLanguageHandler (event, args) {
    const lng = args?.language ?? 'en'

    await i18next.changeLanguage(lng)

    const language = i18next.resolvedLanguage
    await this.configsKeeper
      .saveConfigs({ language })

    return language
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
