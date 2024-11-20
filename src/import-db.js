'use strict'

const { dialog, BrowserWindow } = require('electron')
const i18next = require('i18next')

const {
  InvalidFilePathError,
  DbImportingError
} = require('./errors')
const { unzip } = require('./archiver')
const showErrorModalDialog = require('./show-error-modal-dialog')
const pauseApp = require('./pause-app')
const relaunch = require('./relaunch')
const { rm, isMainWinAvailable } = require('./helpers')
const wins = require('./window-creators/windows')
const {
  setLoadingDescription
} = require('./window-creators/change-loading-win-visibility-state')
const {
  DB_FILE_NAME,
  DB_SHM_FILE_NAME,
  DB_WAL_FILE_NAME,
  SECRET_KEY_FILE_NAME
} = require('./const')

const _rmDbExcludeMain = async (folderPath, dbFileName) => {
  try {
    await rm(
      folderPath,
      {
        exclude: [dbFileName],
        include: ['.db', '.db-shm', '.db-wal']
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
  return async () => {
    const win = isMainWinAvailable(wins.mainWindow)
      ? wins.mainWindow
      : BrowserWindow.getFocusedWindow()

    try {
      const {
        filePaths,
        canceled
      } = await dialog.showOpenDialog(
        win,
        {
          title: i18next.t('common.importDB.openDialog.title'),
          defaultPath: pathToUserDocuments,
          buttonLabel: i18next
            .t('common.importDB.openDialog.buttonLabel'),
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

      const progressHandler = async (args) => {
        const {
          progress,
          prettyUnzippedBytes
        } = args ?? {}

        const _description = i18next
          .t('common.importDB.loadingWindow.description')
        const _unzipped = i18next.t(
          'common.importDB.loadingWindow.unzippedBytes',
          { prettyUnzippedBytes }
        )

        const unzipped = prettyUnzippedBytes
          ? `<br><small style="color:#808b93">${_unzipped}</small>`
          : ''
        const description = `${_description}${unzipped}`

        await setLoadingDescription({ progress, description })
      }

      await pauseApp({
        loadingWinParams: {
          description: i18next
            .t('common.importDB.loadingWindow.description')
        }
      })
      await _rmDbExcludeMain(pathToUserData, DB_FILE_NAME)
      const extractedfileNames = await unzip(
        filePaths[0],
        pathToUserData,
        {
          extractFiles: [
            DB_FILE_NAME,
            DB_SHM_FILE_NAME,
            DB_WAL_FILE_NAME,
            SECRET_KEY_FILE_NAME
          ],
          progressHandler
        }
      )

      if (extractedfileNames.every(file => file !== DB_FILE_NAME)) {
        throw new DbImportingError()
      }

      relaunch()
    } catch (err) {
      try {
        const _win = isMainWinAvailable(wins.loadingWindow)
          ? wins.loadingWindow
          : win
        await showErrorModalDialog(
          _win,
          i18next.t('common.importDB.modalDialog.title'),
          err
        )
      } catch (err) {
        console.error(err)
      }

      console.error(err)
      relaunch()
    }
  }
}
