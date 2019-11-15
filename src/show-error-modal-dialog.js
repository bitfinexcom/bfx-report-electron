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

    return _showErrorBox(win, title, content)
  }
  if (err.code === 'EACCES') {
    const message = 'Permission denied'
    const content = (err.syscall && err.path)
      ? `${message}, ${err.syscall}: '${err.path}'`
      : message

    return _showErrorBox(win, title, content)
  }
  if (err instanceof InvalidFilePathError) {
    const message = 'Invalid file path'

    return _showErrorBox(win, title, message)
  }
  if (err instanceof InvalidFileNameInArchiveError) {
    const message = 'Invalid file name in archive'

    return _showErrorBox(win, title, message)
  }
  if (
    err instanceof DbImportingError ||
    err instanceof InvalidFolderPathError
  ) {
    const message = 'The database has not imported'

    return _showErrorBox(win, title, message)
  }

  const message = 'An unexpected exception occurred'

  return _showErrorBox(win, title, message)
}
