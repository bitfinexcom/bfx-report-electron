'use strict'

const { dialog, BrowserWindow } = require('electron')

const wins = require('./window-creators/windows')
const isMainWinAvailable = require('./helpers/is-main-win-available')

module.exports = async (win, opts = {}) => {
  const defaultWin = isMainWinAvailable(wins.mainWindow)
    ? wins.mainWindow
    : BrowserWindow.getFocusedWindow()
  const parentWin = win && typeof win === 'object'
    ? win
    : defaultWin

  const {
    response: btnId,
    checkboxChecked
  } = await dialog.showMessageBox(parentWin, {
    type: 'info',
    buttons: ['Cancel', 'OK'],
    defaultId: 1,
    cancelId: 0,
    title: '',
    message: '',
    detail: '',
    ...opts
  })

  return {
    btnId,
    checkboxChecked
  }
}
