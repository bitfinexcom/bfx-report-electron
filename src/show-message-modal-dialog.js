'use strict'

const electron = require('electron')

module.exports = async (win, opts = {}) => {
  const dialog = electron.dialog || electron.remote.dialog
  const _win = win && typeof win === 'object'
    ? win
    : electron.BrowserWindow.getFocusedWindow()

  const {
    response: btnId,
    checkboxChecked
  } = await dialog.showMessageBox(_win, {
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
