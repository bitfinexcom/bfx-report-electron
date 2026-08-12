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
      const mainConfsKeeper = getConfigsKeeperByName()
      const pathToUserReportFiles = mainConfsKeeper
        .getConfigByName('pathToUserReportFiles')
      const {
        filePaths,
        canceled
      } = await dialog.showOpenDialog(
        win,
        {
          title: i18next.t('changeReportsFolder.modalDialog.title'),
          defaultPath: pathToUserReportFiles ?? pathToUserDocuments,
          buttonLabel: i18next.t('changeReportsFolder.modalDialog.buttonLabel'),
          properties: [
            'openDirectory',
            'createDirectory',
            'promptToCreate',
            'treatPackageAsDirectory'
          ]
        }
      )

      const newReportFilePath = filePaths?.[0]

      if (
        canceled ||
        !newReportFilePath ||
        newReportFilePath === pathToUserReportFiles
      ) {
        return
      }
      if (typeof newReportFilePath !== 'string') {
        throw new InvalidFilePathError()
      }

      // TODO:
      // await makeReportFolderAndShowModalIfNoWritePerm({
      //   pathToUserReportFiles: newReportFilePath
      // })

      await pauseApp()
      const isSaved = await mainConfsKeeper.saveConfigs({
        reportFilesPathVersion: REPORT_FILES_PATH_VERSION,
        pathToUserReportFiles: newReportFilePath
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
