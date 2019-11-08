'use strict'

const path = require('path')
const electron = require('electron')

const {
  InvalidFilePathError,
  DbImportingError
} = require('./errors')
const { unzip } = require('./archiver')
const showErrorModalDialog = require('./show-error-modal-dialog')
const pauseApp = require('./pause-app')
const relaunch = require('./relaunch')

module.exports = ({ dbPath }) => {
  const dialog = electron.dialog || electron.remote.dialog
  const app = electron.app || electron.remote.app
  const folderPath = path.dirname(dbPath)
  const dbFileName = path.basename(dbPath)

  return () => {
    dialog.showOpenDialog(
      null,
      {
        title: 'ZIP file with DB',
        defaultPath: app.getPath('documents'),
        properties: [
          'openFile',
          'createDirectory',
          'treatPackageAsDirectory'
        ],
        filters: [{ name: 'ZIP', extensions: ['zip'] }]
      },
      async (files) => {
        try {
          if (
            !Array.isArray(files) ||
            files.length === 0 ||
            files.some(file => (!file || typeof file !== 'string'))
          ) {
            throw new InvalidFilePathError()
          }

          await pauseApp()
          // TODO: need to remove 'db-sqlite_sync_m0.db' and 'db-sqlite_sync_m0.db-journal' files before unzipping
          const extractedfileNames = await unzip(
            files[0],
            folderPath,
            { extractFiles: [dbFileName] }
          )

          if (extractedfileNames.every(file => file !== dbFileName)) {
            throw new DbImportingError(DbImportingError)
          }

          relaunch()
        } catch (err) {
          showErrorModalDialog(err)

          console.error(err)
          relaunch()
        }
      }
    )
  }
}
