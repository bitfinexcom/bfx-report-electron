'use strict'

const electron = require('electron')

module.exports = (err) => {
  const dialog = electron.dialog || electron.remote.dialog

  if (err.code === 'ENOENT') {
    const title = 'No such file or directory'
    const content = (err.syscall && err.path)
      ? `${title}, ${err.syscall}: '${err.path}'`
      : title

    dialog.showErrorBox(title, content)

    return
  }
  if (err.code === 'EACCES') {
    const title = 'Permission denied'
    const content = (err.syscall && err.path)
      ? `${title}, ${err.syscall}: '${err.path}'`
      : title

    dialog.showErrorBox(title, content)

    return
  }

  dialog.showErrorBox('Error', 'An unexpected exception occurred')
}
