'use strict'

const electron = require('electron')

const showErrorModalDialog = require('./show-error-modal-dialog')
const showMessageModalDialog = require('./show-message-modal-dialog')
const pauseApp = require('./pause-app')
const relaunch = require('./relaunch')
const { rm } = require('./helpers')
const { DbRemovingError } = require('./errors')
const {
  DB_FILE_NAME,
  SECRET_KEY_FILE_NAME
} = require('./const')

const _rmDb = async (pathToUserData) => {
  try {
    await rm(
      pathToUserData,
      {
        include: [
          DB_FILE_NAME,
          SECRET_KEY_FILE_NAME,
          '.db'
        ]
      }
    )
  } catch (err) {
    console.error(err)

    throw new DbRemovingError()
  }
}

module.exports = ({ pathToUserData }) => {
  return async () => {
    const win = electron.BrowserWindow.getFocusedWindow()

    try {
      const {
        btnId
      } = await showMessageModalDialog(win, {
        type: 'question',
        title: 'Remove database',
        message: 'Are you sure to remove the database?'
      })
      const isOkBtnPushed = btnId === 1

      if (!isOkBtnPushed) {
        return
      }

      await pauseApp()
      await _rmDb(pathToUserData)
      relaunch()
    } catch (err) {
      try {
        await showErrorModalDialog(win, 'Remove database', err)
      } catch (err) {
        console.error(err)
      }

      console.error(err)
      relaunch()
    }
  }
}
