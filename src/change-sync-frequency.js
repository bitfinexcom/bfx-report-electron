'use strict'

const electron = require('electron')

const {
  SyncFrequencyChangingError
} = require('./errors')
const showErrorModalDialog = require('./show-error-modal-dialog')
const pauseApp = require('./pause-app')
const relaunch = require('./relaunch')
const { getConfigsKeeperByName } = require('./configs-keeper')

module.exports = () => {
  return async () => {
    const win = electron.BrowserWindow.getFocusedWindow()

    try {
      const schedulerRule = '' // TODO:

      await pauseApp()
      const isSaved = await getConfigsKeeperByName('main')
        .saveConfigs({ schedulerRule })

      if (!isSaved) {
        throw new SyncFrequencyChangingError()
      }

      relaunch()
    } catch (err) {
      try {
        await showErrorModalDialog(win, 'Change sync frequency', err)
      } catch (err) {
        console.error(err)
      }

      console.error(err)
      relaunch()
    }
  }
}
