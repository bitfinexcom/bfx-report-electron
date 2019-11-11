'use strict'

const {
  InvalidFilePathError,
  InvalidFileNameInArchiveError,
  DbImportingError,
  InvalidFolderPathError
} = require('./errors')
const showMessageModalDialog = require('./show-message-modal-dialog')

const _showErrorBox = (win, title = '', message = '') => {
  return showMessageModalDialog(win, {
    type: 'error',
    buttons: ['Cancel'],
    defaultId: 0,
    cancelId: 0,
    title,
    message
  })
}

module.exports = (win, title = 'Error', err) => {
  if (err.code === 'ENOENT') {
    const message = 'No such file or directory'
    const content = (err.syscall && err.path)
      ? `${message}, ${err.syscall}: '${err.path}'`
      : message

    _showErrorBox(win, title, content)

    return
  }
  if (err.code === 'EACCES') {
    const message = 'Permission denied'
    const content = (err.syscall && err.path)
      ? `${message}, ${err.syscall}: '${err.path}'`
      : message

    _showErrorBox(win, title, content)

    return
  }
  if (err instanceof InvalidFilePathError) {
    const message = 'Invalid file path'

    _showErrorBox(win, title, message)

    return
  }
  if (err instanceof InvalidFileNameInArchiveError) {
    const message = 'Invalid file name in archive'

    _showErrorBox(win, title, message)

    return
  }
  if (
    err instanceof DbImportingError ||
    err instanceof InvalidFolderPathError
  ) {
    const message = 'The database has not imported'

    _showErrorBox(win, title, message)

    return
  }

  _showErrorBox(win, title, 'An unexpected exception occurred')
}
