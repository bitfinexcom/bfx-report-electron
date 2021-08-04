'use strict'

const path = require('path')
const electron = require('electron')

const { InvalidFilePathError } = require('./errors')
const { zip } = require('./archiver')
const showErrorModalDialog = require('./show-error-modal-dialog')
const showMessageModalDialog = require('./show-message-modal-dialog')
const {
  showLoadingWindow,
  hideLoadingWindow
} = require('./change-loading-win-visibility-state')
const {
  DEFAULT_ARCHIVE_DB_FILE_NAME,
  DB_FILE_NAME,
  DB_SHM_FILE_NAME,
  DB_WAL_FILE_NAME,
  SECRET_KEY_FILE_NAME
} = require('./const')

module.exports = ({
  pathToUserData,
  pathToUserDocuments
}) => {
  const dialog = electron.dialog || electron.remote.dialog

  const _timestamp = (new Date()).toISOString().split('.')[0]
  const timestamp = _timestamp.replace(/[:]/g, '-')
  const defaultPath = path.join(
    pathToUserDocuments,
    `${DEFAULT_ARCHIVE_DB_FILE_NAME}-${timestamp}.zip`
  )
  const dbPath = path.join(pathToUserData, DB_FILE_NAME)
  const dbShmPath = path.join(pathToUserData, DB_SHM_FILE_NAME)
  const dbWalPath = path.join(pathToUserData, DB_WAL_FILE_NAME)
  const secretKeyPath = path.join(pathToUserData, SECRET_KEY_FILE_NAME)

  return async () => {
    const win = electron.BrowserWindow.getFocusedWindow()

    try {
      const {
        canceled,
        filePath
      } = await dialog.showSaveDialog(
        win,
        {
          title: 'Database export',
          defaultPath,
          buttonLabel: 'Export',
          filters: [{ name: 'ZIP', extensions: ['zip'] }]
        }
      )

      if (
        canceled ||
        !filePath
      ) {
        return
      }
      if (typeof filePath !== 'string') {
        throw new InvalidFilePathError()
      }

      await showLoadingWindow()
      await zip(filePath, [
        dbPath,
        dbShmPath,
        dbWalPath,
        secretKeyPath
      ])
      await hideLoadingWindow()

      await showMessageModalDialog(win, {
        buttons: ['OK'],
        defaultId: 0,
        title: 'Database export',
        message: 'Exported successfully'
      })
    } catch (err) {
      try {
        await hideLoadingWindow()
        await showErrorModalDialog(win, 'Database export', err)
      } catch (err) {
        console.error(err)
      }

      console.error(err)
    }
  }
}
