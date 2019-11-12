'use strict'

const electron = require('electron')

const { app } = electron

const windows = require('./windows')

module.exports = () => {
  return app.makeSingleInstance(() => {
    if (windows.mainWindow) {
      if (windows.mainWindow.isMinimized()) {
        windows.mainWindow.restore()
      }

      windows.mainWindow.focus()
    }
  })
}
