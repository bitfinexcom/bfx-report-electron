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
const {
  DB_FILE_NAME,
  SECRET_KEY_FILE_NAME
} = require('./const')

const _rm = async (
  dir,
  {
    exclude = [],
    include = []
  }
) => {
  if (
    !dir ||
    typeof dir !== 'string' ||
    dir === '/'
  ) {
    throw new InvalidFolderPathError()
  }

  const files = await readdir(dir)
  const promisesArr = files.map(async (file) => {
    if (
      Array.isArray(exclude) &&
      exclude.some(exFile => new RegExp(exFile).test(file))
    ) {
      return
    }
    if (
      Array.isArray(include) &&
      include.every(inFile => !(new RegExp(inFile).test(file)))
    ) {
      return
    }

    return unlink(path.join(dir, file))
  })

  return Promise.all(promisesArr)
}

const _rmDbExcludeMain = async (folderPath, dbFileName) => {
  try {
    await _rm(
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

module.exports = ({ pathToUserData }) => {
  const dialog = electron.dialog || electron.remote.dialog
  const app = electron.app || electron.remote.app

  return () => {
    const win = electron.BrowserWindow.getFocusedWindow()

    dialog.showOpenDialog(
      win,
      {
        title: 'Database import',
        defaultPath: app.getPath('documents'),
        buttonLabel: 'Import',
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
          await _rmDbExcludeMain(pathToUserData, DB_FILE_NAME)
          const extractedfileNames = await unzip(
            files[0],
            pathToUserData,
            { extractFiles: [DB_FILE_NAME, SECRET_KEY_FILE_NAME] }
          )

          if (extractedfileNames.every(file => file !== DB_FILE_NAME)) {
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
