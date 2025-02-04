'use strict'

const { nativeTheme } = require('electron')

const IpcChannelHandlers = require('./ipc.channel.handlers')
const { getConfigsKeeperByName } = require('../../configs-keeper')

class ThemeIpcChannelHandlers extends IpcChannelHandlers {
  static channelName = 'theme'

  static THEME_SOURCES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
  }

  async setThemeHandler (event, args) {
    if (args?.isSystemTheme) {
      return this.#saveTheme(this.constructor.THEME_SOURCES.SYSTEM)
    }
    if (args?.isDarkTheme) {
      return this.#saveTheme(this.constructor.THEME_SOURCES.DARK)
    }
    if (args?.isLightTheme) {
      return this.#saveTheme(this.constructor.THEME_SOURCES.LIGHT)
    }

    return this.getThemeHandler()
  }

  async getThemeHandler (event, args) {
    return {
      isSystemTheme: nativeTheme.themeSource === this.constructor.THEME_SOURCES.SYSTEM,
      isDarkTheme: nativeTheme.shouldUseDarkColors,
      isLightTheme: !nativeTheme.shouldUseDarkColors
    }
  }

  static isThemeAllowed (theme) {
    return Object.values(this.THEME_SOURCES)
      .some((item) => item === theme)
  }

  async #saveTheme (theme) {
    if (!this.constructor.isThemeAllowed(theme)) {
      return this.getThemeHandler()
    }

    const configsKeeper = getConfigsKeeperByName('main')
    const isSaved = await configsKeeper
      ?.saveConfigs?.({ theme })

    if (isSaved) {
      nativeTheme.themeSource = theme
    }

    return this.getThemeHandler()
  }
}

module.exports = ThemeIpcChannelHandlers
