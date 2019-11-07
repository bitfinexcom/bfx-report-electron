'use strict'

const path = require('path')
const electron = require('electron')

const { InvalidFilePathError } = require('./errors')
const { zip } = require('./archiver')
const showErrorModalDialog = require('./show-error-modal-dialog')

const DEFAULT_FILE_NAME = 'bfx-report-db-archive'

module.exports = ({ dbPath }) => {
  const dialog = electron.dialog || electron.remote.dialog
  const app = electron.app || electron.remote.app
  const timestamp = (new Date()).toISOString().split('.')[0]
  const defaultPath = path.join(
    app.getPath('documents'),
    `${DEFAULT_FILE_NAME}-${timestamp}`
  )

  return () => {
    dialog.showSaveDialog(
      null,
      {
        title: 'ZIP file with DB',
        defaultPath,
        filters: [{ name: 'ZIP', extensions: ['zip'] }]
      },
      async (file) => {
        try {
          if (
            !file ||
            typeof file !== 'string'
          ) {
            throw new InvalidFilePathError()
          }

          await zip(file, dbPath)
        } catch (err) {
          showErrorModalDialog(err)

          console.error(err)
        }
      }
    )
  }
}
