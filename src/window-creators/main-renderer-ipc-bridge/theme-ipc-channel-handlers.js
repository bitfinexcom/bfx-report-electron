'use strict'

const { nativeTheme } = require('electron')

const IpcChannelHandlers = require('./ipc.channel.handlers')

class ThemeIpcChannelHandlers extends IpcChannelHandlers {
  static channelName = 'theme'

  static THEME_SOURCES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
  }

  static isThemeAllowed (theme) {
    return Object.values(this.THEME_SOURCES)
      .some((item) => item === theme)
  }

  async setThemeHandler (event, args) {
    if (args?.isSystemTheme) {
      nativeTheme.themeSource = this.constructor.THEME_SOURCES.SYSTEM

      return this.getThemeHandler()
    }
    if (args?.isDarkTheme) {
      nativeTheme.themeSource = this.constructor.THEME_SOURCES.DARK

      return this.getThemeHandler()
    }
    if (args?.isLightTheme) {
      nativeTheme.themeSource = this.constructor.THEME_SOURCES.LIGHT

      return this.getThemeHandler()
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
}

module.exports = ThemeIpcChannelHandlers
