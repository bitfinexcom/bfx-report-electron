'use strict'

const path = require('path')
const { promisify } = require('util')
const fs = require('fs')
const electron = require('electron')

const readdir = promisify(fs.readdir)
const unlink = promisify(fs.unlink)

const {
  InvalidFilePathError,
  DbImportingError,
  InvalidFolderPathError
} = require('./errors')
const { unzip } = require('./archiver')
const showErrorModalDialog = require('./show-error-modal-dialog')
const pauseApp = require('./pause-app')
const relaunch = require('./relaunch')

const _rmDb = async (dir, exclude = []) => {
  if (
    !dir ||
    typeof dir !== 'string' ||
    dir === '/'
  ) {
    throw new InvalidFolderPathError()
  }

  const files = await readdir(dir)
  const promisesArr = files.map(async (file) => {
    if (exclude.every(exFile => exFile !== file)) {
      return unlink(path.join(dir, file))
    }
  })

  return Promise.all(promisesArr)
}

const _rmDbExcludeMain = async (folderPath, dbFileName) => {
  try {
    await _rmDb(folderPath, ['.gitkeep', dbFileName])

    return true
  } catch (err) {
    return false
  }
}

module.exports = ({ dbPath }) => {
  const dialog = electron.dialog || electron.remote.dialog
  const app = electron.app || electron.remote.app
  const folderPath = path.dirname(dbPath)
  const dbFileName = path.basename(dbPath)

  return () => {
    const win = electron.BrowserWindow.getFocusedWindow()

    dialog.showOpenDialog(
      win,
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
            files.length === 0
          ) {
            return
          }
          if (files.some(file => (
            !file || typeof file !== 'string'
          ))) {
            throw new InvalidFilePathError()
          }

          await pauseApp()
          await _rmDbExcludeMain(folderPath, dbFileName)
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
          await showErrorModalDialog(win, 'Database import', err)

          console.error(err)
          relaunch()
        }
      }
    )
  }
}
