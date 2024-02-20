'use strict'

const { dialog, BrowserWindow } = require('electron')

const { REPORT_FILES_PATH_VERSION } = require('./const')

const {
  InvalidFilePathError,
  ReportsFolderChangingError
} = require('./errors')
const showErrorModalDialog = require('./show-error-modal-dialog')
const pauseApp = require('./pause-app')
const relaunch = require('./relaunch')
const { getConfigsKeeperByName } = require('./configs-keeper')

module.exports = ({ pathToUserDocuments }) => {
  return async () => {
    const win = BrowserWindow.getFocusedWindow()

    try {
      const {
        filePaths,
        canceled
      } = await dialog.showOpenDialog(
        win,
        {
          title: 'Change reports folder',
          defaultPath: pathToUserDocuments,
          buttonLabel: 'Select',
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
        await showErrorModalDialog(win, 'Change reports folder', err)
      } catch (err) {
        console.error(err)
      }

      console.error(err)
      relaunch()
    }
  }
}
