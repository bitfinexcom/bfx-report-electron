'use strict'

const electron = require('electron')

const ipcs = require('./ipcs')
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
    state: 'clear-all-tables'
  })

  return new Promise((resolve, reject) => {
    const handlerMess = (mess) => {
      const { state } = { ...mess }

      if (state !== 'all-tables-have-been-cleared') {
        return
      }

      ipc.removeListener('error', reject)
      ipc.removeListener('message', handler)

      resolve()
    }
    const handlerErr = (err) => {
      ipc.removeListener('message', handlerMess)

      reject(err)
    }

    ipc.once('error', handlerErr)
    ipc.on('message', handlerMess)
  })
}

const _removeDb = async ({
  pathToUserData,
  shouldAllTablesBeCleared
}) => {
  if (shouldAllTablesBeCleared) {
    await _clearAllTables()

    return
  }

  await _rmDb(pathToUserData)
}

module.exports = ({
  pathToUserData,
  shouldAllTablesBeCleared
}) => {
  return async () => {
    const win = electron.BrowserWindow.getFocusedWindow()

    try {
      const {
        btnId
      } = await showMessageModalDialog(win, {
        type: 'question',
        title: 'Remove database',
        message: 'Are you sure you want to remove the database?'
      })
      const isOkBtnPushed = btnId === 1

      if (!isOkBtnPushed) {
        return
      }

      await pauseApp()
      await _removeDb({
        pathToUserData,
        shouldAllTablesBeCleared
      })
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
