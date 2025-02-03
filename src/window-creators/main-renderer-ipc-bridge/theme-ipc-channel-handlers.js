'use strict'

const { nativeTheme } = require('electron')

const IpcChannelHandlers = require('./ipc.channel.handlers')

class ThemeIpcChannelHandlers extends IpcChannelHandlers {
  static channelName = 'theme'

  async getThemeHandler (event, args) {
    return {
      isSystemTheme: nativeTheme.themeSource === 'system',
      isDarkTheme: nativeTheme.shouldUseDarkColors,
      isLightTheme: !nativeTheme.shouldUseDarkColors
    }
  }
}

module.exports = ThemeIpcChannelHandlers
