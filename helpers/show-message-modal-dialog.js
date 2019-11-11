'use strict'

const electron = require('electron')

module.exports = (win, opts = {}) => {
  return new Promise((resolve, reject) => {
    const dialog = electron.dialog || electron.remote.dialog

    try {
      dialog.showMessageBox(win, {
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
