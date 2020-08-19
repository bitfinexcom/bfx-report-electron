'use strict'

const electron = require('electron')

const {
  InvalidFilePathError,
  DbImportingError
} = require('./errors')
const { unzip } = require('./archiver')
const showErrorModalDialog = require('./show-error-modal-dialog')
const pauseApp = require('./pause-app')
const relaunch = require('./relaunch')
const { rm } = require('./helpers')
const {
  DB_FILE_NAME,
  SECRET_KEY_FILE_NAME
} = require('./const')

const _rmDbExcludeMain = async (folderPath, dbFileName) => {
  try {
    await rm(
      folderPath,
      {
        exclude: [dbFileName],
        include: ['.db']
      }
    )

    return true
  } catch (err) {
    return false
  }
}

module.exports = ({
  pathToUserData,
  pathToUserDocuments
}) => {
  const dialog = electron.dialog || electron.remote.dialog

  return async () => {
    const win = electron.BrowserWindow.getFocusedWindow()

    try {
      const {
        filePaths,
        canceled
      } = await dialog.showOpenDialog(
        win,
        {
          title: 'Database import',
          defaultPath: pathToUserDocuments,
          buttonLabel: 'Import',
          properties: [
            'openFile',
            'createDirectory',
            'treatPackageAsDirectory'
          ],
          filters: [{ name: 'ZIP', extensions: ['zip'] }]
        }
      )

      if (
        canceled ||
        !Array.isArray(filePaths) ||
        filePaths.length === 0
      ) {
        return
      }
      if (filePaths.some(file => (
        !file || typeof file !== 'string'
      ))) {
        throw new InvalidFilePathError()
      }

      await pauseApp()
      await _rmDbExcludeMain(pathToUserData, DB_FILE_NAME)
      const extractedfileNames = await unzip(
        filePaths[0],
        pathToUserData,
        { extractFiles: [DB_FILE_NAME, SECRET_KEY_FILE_NAME] }
      )

      if (extractedfileNames.every(file => file !== DB_FILE_NAME)) {
        throw new DbImportingError()
      }

      relaunch()
    } catch (err) {
      try {
        await showErrorModalDialog(win, 'Database import', err)
      } catch (err) {
        console.error(err)
      }

      console.error(err)
      relaunch()
    }
  }
}
