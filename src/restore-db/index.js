'use strict'

const { app } = require('electron')
const i18next = require('i18next')

const ipcs = require('../ipcs')
const wins = require('../window-creators/windows')
const {
  createModalWindow
} = require('../window-creators')
const {
  deserializeError
} = require('../helpers/utils')
const isMainWinAvailable = require(
  '../helpers/is-main-win-available'
)
const showMessageModalDialog = require(
  '../show-message-modal-dialog'
)
const {
  DbRestoringError
} = require('../errors')

const PROCESS_MESSAGES = require(
  '../../bfx-reports-framework/workers/loc.api/process.message.manager/process.messages'
)
const PROCESS_STATES = require(
  '../../bfx-reports-framework/workers/loc.api/process.message.manager/process.states'
)

const _fireAlert = async (params) => {
  const { backupFilesMetadata } = params ?? {}
  const inputRadioOptions = backupFilesMetadata.map((item, i) => {
    return {
      label: item?.name,
      value: item?.name,
      checked: i === 0
    }
  })

  const res = await createModalWindow(
    {
      icon: 'question',
      title: i18next.t('restoreDB.modalDialog.title'),
      showConfirmButton: true,
      confirmButtonText: i18next.t('common.confirmButtonText'),
      showCancelButton: true,
      cancelButtonText: i18next.t('common.cancelButtonText'),
      focusCancel: true,
      inputRadioOptions
    },
    {
      width: 600,
      height: 600,
      shouldWinBeClosedIfClickingOutside: true
    }
  )

  return res?.modalRes ?? {}
}

const _getBackupFilesMetadata = (ipc) => {
  return new Promise((resolve, reject) => {
    try {
      let interval = null

      const rmHandler = () => {
        ipc.off('message', handler)
        clearInterval(interval)
      }
      const handler = (mess) => {
        if (mess?.state !== PROCESS_MESSAGES.RESPONSE_GET_BACKUP_FILES_METADATA) {
          return
        }

        const { data } = mess

        interval = setInterval(() => {
          rmHandler()
          reject(new DbRestoringError())
        }, 30 * 1000).unref()

        if (data?.err) {
          rmHandler()
          reject(deserializeError(data.err))

          return
        }

        rmHandler()
        resolve(data?.backupFilesMetadata)
      }

      ipc.on('message', handler)
      ipc.send({
        state: PROCESS_STATES.REQUEST_GET_BACKUP_FILES_METADATA
      })
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = () => {
  return async () => {
    try {
      if (
        !app.isReady() ||
        !isMainWinAvailable()
      ) {
        throw new DbRestoringError()
      }

      const backupFilesMetadata = await _getBackupFilesMetadata(
        ipcs.serverIpc
      )

      if (
        !Array.isArray(backupFilesMetadata) ||
        backupFilesMetadata.length === 0
      ) {
        await showMessageModalDialog(wins.mainWindow, {
          type: 'warning',
          title: i18next.t('restoreDB.messageModalDialog.title'),
          message: i18next.t('restoreDB.messageModalDialog.message'),
          buttons: [i18next.t('common.confirmButtonText')],
          defaultId: 0,
          cancelId: 0
        })

        return
      }

      const res = await _fireAlert({ backupFilesMetadata })

      if (res?.dismiss !== 'confirm') {
        return
      }

      ipcs.serverIpc.send({
        state: PROCESS_STATES.RESTORE_DB,
        data: { name: res.inputRadioValue }
      })
    } catch (err) {
      console.error(err)
    }
  }
}
