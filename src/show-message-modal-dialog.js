'use strict'

const { dialog, BrowserWindow } = require('electron')
const i18next = require('i18next')

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
    buttons: [
      i18next.t('common.showMessageModalDialog.cancelButtonText'),
      i18next.t('common.showMessageModalDialog.confirmButtonText')
    ],
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
