'use strict'

const { BrowserWindow } = require('electron')
const i18next = require('i18next')

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
  DB_SHM_FILE_NAME,
  DB_WAL_FILE_NAME,
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
          DB_SHM_FILE_NAME,
          DB_WAL_FILE_NAME,
          SECRET_KEY_FILE_NAME
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
      ? i18next.t('removeDB.modalDialog.clearDataTitle')
      : i18next.t('removeDB.modalDialog.removeDBTitle')
    const message = shouldAllTablesBeCleared
      ? i18next.t('removeDB.modalDialog.clearDataMessage')
      : i18next.t('removeDB.modalDialog.removeDBMessage')

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
        },
        loadingWinParams: {
          description: shouldAllTablesBeCleared
            ? i18next.t('removeDB.loadingWindow.clearingAllDataDescription')
            : i18next.t('removeDB.loadingWindow.removingDBDescription')
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
