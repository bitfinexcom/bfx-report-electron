'use strict'

const electron = require('electron')

const {
  InvalidFilePathError,
  ReportsFolderChangingError
} = require('./errors')
const showErrorModalDialog = require('./show-error-modal-dialog')
const pauseApp = require('./pause-app')
const relaunch = require('./relaunch')
const { getConfigsKeeperByName } = require('./configs-keeper')

module.exports = ({ pathToUserDocuments }) => {
  const dialog = electron.dialog || electron.remote.dialog

  return () => {
    const win = electron.BrowserWindow.getFocusedWindow()

    dialog.showOpenDialog(
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
          const isSaved = await getConfigsKeeperByName('main')
            .saveConfigs({ pathToUserCsv: files[0] })

          if (!isSaved) {
            throw new ReportsFolderChangingError()
          }

          relaunch()
        } catch (err) {
          await showErrorModalDialog(win, 'Change reports folder', err)

          console.error(err)
          relaunch()
        }
      }
    )
  }
}
