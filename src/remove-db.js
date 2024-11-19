'use strict'

const { BrowserWindow } = require('electron')

const ipcs = require('./ipcs')
const showErrorModalDialog = require('./show-error-modal-dialog')
const showMessageModalDialog = require('./show-message-modal-dialog')
const wins = require('./window-creators/windows')
const isMainWinAvailable = require('./helpers/is-main-win-available')
const pauseApp = require('./pause-app')
const relaunch = require('./relaunch')
const { rm } = require('./helpers')
const { DbRemovingError } = require('./errors')
const {
  DB_FILE_NAME,
  SECRET_KEY_FILE_NAME
} = require('./const')

const PROCESS_MESSAGES = require(
  '../bfx-reports-framework/workers/loc.api/process.message.manager/process.messages'
)
const PROCESS_STATES = require(
  '../bfx-reports-framework/workers/loc.api/process.message.manager/process.states'
)

const _rmDb = async (pathToUserData) => {
  try {
    await rm(
      pathToUserData,
      {
        include: [
          DB_FILE_NAME,
          SECRET_KEY_FILE_NAME,
          '.db',
          '.db-shm',
          '.db-wal'
        ]
      }
    )
  } catch (err) {
    console.error(err)

    throw new DbRemovingError()
  }
}

const _clearAllTables = () => {
  ipcs.serverIpc.send({
    state: PROCESS_STATES.CLEAR_ALL_TABLES
  })

  return new Promise((resolve, reject) => {
    const handlerMess = (mess) => {
      const { state } = { ...mess }

      if (
        state !== PROCESS_MESSAGES.ALL_TABLE_HAVE_BEEN_CLEARED &&
        state !== PROCESS_MESSAGES.ALL_TABLE_HAVE_NOT_BEEN_CLEARED
      ) {
        return
      }

      ipcs.serverIpc.removeListener('error', handlerErr)
      ipcs.serverIpc.removeListener('message', handlerMess)

      if (state === PROCESS_MESSAGES.ALL_TABLE_HAVE_NOT_BEEN_CLEARED) {
        reject(new DbRemovingError(state))

        return
      }

      resolve()
    }
    const handlerErr = (err) => {
      ipcs.serverIpc.removeListener('message', handlerMess)

      reject(err)
    }

    ipcs.serverIpc.once('error', handlerErr)
    ipcs.serverIpc.on('message', handlerMess)
  })
}

module.exports = ({
  pathToUserData,
  shouldAllTablesBeCleared
}) => {
  return async () => {
    const win = isMainWinAvailable(wins.mainWindow)
      ? wins.mainWindow
      : BrowserWindow.getFocusedWindow()
    const title = shouldAllTablesBeCleared
      ? 'Clear all data'
      : 'Remove database'
    const message = shouldAllTablesBeCleared
      ? 'Are you sure you want to clear all data?'
      : 'Are you sure you want to remove the database?'

    try {
      const {
        btnId
      } = await showMessageModalDialog(win, {
        type: 'question',
        title,
        message
      })
      const isOkBtnPushed = btnId === 1

      if (!isOkBtnPushed) {
        return
      }

      await pauseApp({
        beforeClosingServHook: async () => {
          if (!shouldAllTablesBeCleared) {
            return
          }

          await _clearAllTables()
        }
      })

      if (!shouldAllTablesBeCleared) {
        await _rmDb(pathToUserData)
      }

      relaunch()
    } catch (err) {
      try {
        const _win = isMainWinAvailable(wins.loadingWindow)
          ? wins.loadingWindow
          : win
        await showErrorModalDialog(_win, title, err)
      } catch (err) {
        console.error(err)
      }

      console.error(err)
      relaunch()
    }
  }
}
