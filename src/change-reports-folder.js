'use strict'

const { dialog, BrowserWindow } = require('electron')
const i18next = require('i18next')

const { REPORT_FILES_PATH_VERSION } = require('./const')

const {
  InvalidFilePathError,
  ReportsFolderChangingError
} = require('./errors')
const showErrorModalDialog = require('./show-error-modal-dialog')
const pauseApp = require('./pause-app')
const relaunch = require('./relaunch')
const { getConfigsKeeperByName } = require('./configs-keeper')
const wins = require('./window-creators/windows')
const isMainWinAvailable = require('./helpers/is-main-win-available')

module.exports = ({ pathToUserDocuments }) => {
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
          title: i18next.t('changeReportsFolder.modalDialog.title'),
          defaultPath: pathToUserDocuments,
          buttonLabel: i18next.t('changeReportsFolder.modalDialog.buttonLabel'),
          properties: [
            'openDirectory',
            'createDirectory',
            'promptToCreate',
            'treatPackageAsDirectory'
          ]
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
      const isSaved = await getConfigsKeeperByName('main')
        .saveConfigs({
          reportFilesPathVersion: REPORT_FILES_PATH_VERSION,
          pathToUserReportFiles: filePaths[0]
        })

      if (!isSaved) {
        throw new ReportsFolderChangingError()
      }

      relaunch()
    } catch (err) {
      try {
        await showErrorModalDialog(
          win,
          i18next.t('changeReportsFolder.modalDialog.title'),
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
