'use strict'

const { BrowserWindow } = require('electron')

const wins = require('../../window-creators/windows')
const isMainWinAvailable = require(
  '../../helpers/is-main-win-available'
)

module.exports = () => {
  if (isMainWinAvailable(
    wins.mainWindow,
    { shouldCheckVisibility: true }
  )) {
    return wins.mainWindow
  }
  if (isMainWinAvailable(wins.loadingWindow)) {
    return wins.loadingWindow
  }

  return BrowserWindow.getFocusedWindow()
}
