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

  static WINDOW_BACKGROUND_COLORS = {
    LIGHT: '#ffffff',
    DARK: '#172d3e'
  }

  async setThemeHandler (event, args) {
    const {
      isSystemTheme,
      isDarkTheme,
      isLightTheme
    } = args ?? {}

    if (
      [isSystemTheme, isDarkTheme, isLightTheme]
        .filter((f) => f).length > 1
    ) {
      throw new Error('ERR_INVALID_THEME_PARAM_HAS_BEEN_PASSED')
    }

    if (isSystemTheme) {
      return this.#saveTheme(this.constructor.THEME_SOURCES.SYSTEM)
    }
    if (isDarkTheme) {
      return this.#saveTheme(this.constructor.THEME_SOURCES.DARK)
    }
    if (isLightTheme) {
      return this.#saveTheme(this.constructor.THEME_SOURCES.LIGHT)
    }

    return {
      ...(await this.getThemeHandler()),
      isThemeSavedInConfigs: false
    }
  }

  async getThemeHandler (event, args) {
    return {
      isSystemTheme: nativeTheme.themeSource === this.constructor.THEME_SOURCES.SYSTEM,
      isDarkTheme: nativeTheme.shouldUseDarkColors,
      isLightTheme: !nativeTheme.shouldUseDarkColors
    }
  }

  static getWindowBackgroundColor () {
    if (nativeTheme.shouldUseDarkColors) {
      return this.WINDOW_BACKGROUND_COLORS.DARK
    }

    return this.WINDOW_BACKGROUND_COLORS.LIGHT
  }

  static isThemeAllowed (theme) {
    return Object.values(this.THEME_SOURCES)
      .some((item) => item === theme)
  }

  async #saveTheme (theme) {
    if (!this.constructor.isThemeAllowed(theme)) {
      return {
        ...(await this.getThemeHandler()),
        isThemeSavedInConfigs: false
      }
    }

    const configsKeeper = getConfigsKeeperByName('main')
    const isSaved = await configsKeeper
      ?.saveConfigs?.({ theme })

    if (isSaved) {
      nativeTheme.themeSource = theme
    }

    return {
      ...(await this.getThemeHandler()),
      isThemeSavedInConfigs: isSaved
    }
  }
}

module.exports = ThemeIpcChannelHandlers
