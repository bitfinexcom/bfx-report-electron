'use strict'

const { app } = require('electron')

const windows = require('./window-creators/windows')

module.exports = () => {
  const isGottenLock = app.requestSingleInstanceLock()

  if (isGottenLock) {
    app.on('second-instance', () => {
      if (windows.mainWindow) {
        if (windows.mainWindow.isMinimized()) {
          windows.mainWindow.restore()
        }

        windows.mainWindow.focus()
      }
    })
  }

  return !isGottenLock
}
