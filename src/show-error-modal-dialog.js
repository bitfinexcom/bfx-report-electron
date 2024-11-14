'use strict'

const i18next = require('i18next')

const {
  InvalidFilePathError,
  InvalidFileNameInArchiveError,
  DbImportingError,
  DbRemovingError,
  InvalidFolderPathError,
  ReportsFolderChangingError,
  SyncFrequencyChangingError
} = require('./errors')
const showMessageModalDialog = require('./show-message-modal-dialog')

const _showErrorBox = (win, title = '', message = '') => {
  return showMessageModalDialog(win, {
    type: 'error',
    buttons: [
      i18next.t('common.showErrorModalDialog.confirmButtonText')
    ],
    defaultId: 0,
    cancelId: 0,
    title,
    message
  })
}

module.exports = async (win, title = 'Error', err) => {
  if (err.code === 'ENOENT') {
    const message = i18next.t('common.showErrorModalDialog.enoentErrorMessage')
    const content = (err.syscall && err.path)
      ? `${message}, ${err.syscall}: '${err.path}'`
      : message

    return _showErrorBox(win, title, content)
  }
  if (err.code === 'EACCES') {
    const message = i18next.t('common.showErrorModalDialog.eaccesErrorMessage')
    const content = (err.syscall && err.path)
      ? `${message}, ${err.syscall}: '${err.path}'`
      : message

    return _showErrorBox(win, title, content)
  }
  if (err instanceof InvalidFilePathError) {
    const message = i18next.t('common.showErrorModalDialog.invalidFilePathErrorMessage')

    return _showErrorBox(win, title, message)
  }
  if (err instanceof InvalidFileNameInArchiveError) {
    const message = i18next.t('common.showErrorModalDialog.invalidFileNameInArchErrorMessage')

    return _showErrorBox(win, title, message)
  }
  if (
    err instanceof DbImportingError ||
    err instanceof InvalidFolderPathError
  ) {
    const message = i18next.t('common.showErrorModalDialog.dbImportingErrorMessage')

    return _showErrorBox(win, title, message)
  }
  if (err instanceof DbRemovingError) {
    const message = i18next.t('common.showErrorModalDialog.dbRemovingErrorMessage')

    return _showErrorBox(win, title, message)
  }
  if (err instanceof ReportsFolderChangingError) {
    const message = i18next.t('common.showErrorModalDialog.reportsFolderChangingErrorMessage')

    return _showErrorBox(win, title, message)
  }
  if (err instanceof SyncFrequencyChangingError) {
    const message = i18next.t('common.showErrorModalDialog.syncFrequencyChangingErrorMessage')

    return _showErrorBox(win, title, message)
  }

  const message = i18next.t('common.showErrorModalDialog.syncFrequencyChangingErrorMessage')

  return _showErrorBox(win, title, message)
}
