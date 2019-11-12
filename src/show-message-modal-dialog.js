'use strict'

const electron = require('electron')

module.exports = (win, opts = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const dialog = electron.dialog || electron.remote.dialog
      const _win = win && typeof win === 'object'
        ? win
        : electron.BrowserWindow.getFocusedWindow()

      dialog.showMessageBox(_win, {
        type: 'info',
        buttons: ['Cancel', 'OK'],
        defaultId: 1,
        cancelId: 0,
        title: '',
        message: '',
        ...opts
      }, resolve)
    } catch (err) {
      reject(err)
    }
  })
}
