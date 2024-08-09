'use strict'

const { app, BrowserWindow } = require('electron')

const wins = require('./windows')
const relaunch = require('./relaunch')
const showMessageModalDialog = require(
  './show-message-modal-dialog'
)
const isMainWinAvailable = require(
  './helpers/is-main-win-available'
)
const {
  showWindow
} = require('./helpers/manage-window')
const showTrxTaxReportNotification = require(
  './show-trx-tax-report-notification'
)
const showSyncNotification = require(
  './show-notification/show-sync-notification'
)
const PROCESS_MESSAGES = require(
  '../bfx-reports-framework/workers/loc.api/process.message.manager/process.messages'
)
const PROCESS_STATES = require(
  '../bfx-reports-framework/workers/loc.api/process.message.manager/process.states'
)

module.exports = (ipc) => {
  const win = isMainWinAvailable(
    wins.mainWindow,
    { shouldCheckVisibility: true }
  )
    ? wins.mainWindow
    : BrowserWindow.getFocusedWindow()

  if (!ipc) {
    return
  }

  ipc.on('message', async (mess) => {
    try {
      if (
        !mess ||
        typeof mess !== 'object' ||
        !mess.state ||
        typeof mess.state !== 'string'
      ) {
        return
      }

      const {
        state = '',
        data = {}
      } = mess

      if (state === PROCESS_MESSAGES.ERROR_WORKER) {
        console.error(data?.err)

        return
      }
      if (
        state === PROCESS_MESSAGES.DB_HAS_BEEN_RESTORED ||
        state === PROCESS_MESSAGES.DB_HAS_NOT_BEEN_RESTORED
      ) {
        await showWindow(win)

        const hasNotDbBeenRestored = state === PROCESS_MESSAGES.DB_HAS_NOT_BEEN_RESTORED
        const messChunk = hasNotDbBeenRestored
          ? ' not'
          : ''
        const type = hasNotDbBeenRestored
          ? 'error'
          : 'info'

        await showMessageModalDialog(win, {
          type,
          title: 'DB restoring',
          message: `DB has${messChunk} been restored`,
          buttons: ['OK'],
          defaultId: 0,
          cancelId: 0
        })

        // To enforce migration launch if restores prev db schema version
        if (data?.isNotVerSupported) {
          relaunch()
        }

        return
      }
      if (
        state === PROCESS_MESSAGES.ALL_TABLE_HAVE_BEEN_REMOVED ||
        state === PROCESS_MESSAGES.ALL_TABLE_HAVE_NOT_BEEN_REMOVED
      ) {
        await showWindow(win)

        const haveNotAllDbDataBeenRemoved = state === PROCESS_MESSAGES.ALL_TABLE_HAVE_NOT_BEEN_REMOVED
        const messChunk = haveNotAllDbDataBeenRemoved
          ? ' not'
          : ''
        const type = haveNotAllDbDataBeenRemoved
          ? 'error'
          : 'info'

        await showMessageModalDialog(win, {
          type,
          title: 'DB removing',
          message: `DB data have${messChunk} been removed`,
          buttons: ['OK'],
          defaultId: 0,
          cancelId: 0
        })

        return
      }
      if (
        state === PROCESS_MESSAGES.BACKUP_FINISHED ||
        state === PROCESS_MESSAGES.ERROR_BACKUP
      ) {
        await showWindow(win)

        const isBackupError = state === PROCESS_MESSAGES.ERROR_BACKUP
        const messChunk = isBackupError
          ? ' not'
          : ''
        const type = isBackupError
          ? 'error'
          : 'info'

        await showMessageModalDialog(win, {
          type,
          title: 'DB backup',
          message: `DB backup has${messChunk} been successfully`,
          buttons: ['OK'],
          defaultId: 0,
          cancelId: 0
        })

        if (isBackupError) {
          return
        }
      }
      if (
        state === PROCESS_MESSAGES.BACKUP_PROGRESS ||
        state === PROCESS_MESSAGES.BACKUP_FINISHED
      ) {
        if (!isMainWinAvailable(win)) {
          return
        }

        const calcedProgress = (
          state === PROCESS_MESSAGES.BACKUP_FINISHED ||
          data.progress >= 100
        )
          ? -1
          : data.progress / 100
        const progress = (
          Number.isFinite(calcedProgress) &&
          calcedProgress >= 0 &&
          calcedProgress < 1
        )
          ? calcedProgress
          : -1

        win.setProgressBar(progress)

        return
      }
      if (
        state === PROCESS_MESSAGES.ERROR_MIGRATIONS ||
        state === PROCESS_MESSAGES.READY_MIGRATIONS
      ) {
        await showWindow(win)

        const isMigrationsError = state === PROCESS_MESSAGES.ERROR_MIGRATIONS
        const type = isMigrationsError
          ? 'error'
          : 'info'
        const message = isMigrationsError
          ? 'DВ migration failed, all data has been deleted,\nsynchronization will start from scratch'
          : 'DB migration completed successfully'
        const buttons = isMigrationsError
          ? ['Cancel']
          : ['OK']

        await showMessageModalDialog(win, {
          type,
          message,
          buttons,
          defaultId: 0,
          cancelId: 0
        })

        return
      }
      if (state === PROCESS_MESSAGES.REQUEST_MIGRATION_HAS_FAILED_WHAT_SHOULD_BE_DONE) {
        const {
          btnId
        } = await showMessageModalDialog(win, {
          type: 'question',
          title: 'The migration has failed',
          message: 'What should be done?',
          buttons: ['Exit', 'Try to restore DB', 'Remove DB']
        })

        if (btnId === 0) {
          app.quit()

          return
        }

        ipc.send({
          state: PROCESS_STATES.RESPONSE_MIGRATION_HAS_FAILED_WHAT_SHOULD_BE_DONE,
          data: {
            shouldRestore: btnId === 1,
            shouldRemove: btnId === 2
          }
        })

        return
      }
      if (state === PROCESS_MESSAGES.REQUEST_SHOULD_ALL_TABLES_BE_REMOVED) {
        const title = data.isNotDbRestored
          ? 'DB has not been restored'
          : 'Remove database'

        const {
          btnId
        } = await showMessageModalDialog(win, {
          type: 'question',
          title,
          message: 'Should all tables be removed?',
          buttons: ['Cancel', 'OK']
        })

        if (btnId === 0) {
          if (data.isNotDbRestored) {
            relaunch()
          }

          return
        }

        ipc.send({ state: PROCESS_STATES.REMOVE_ALL_TABLES })
      }
      if (
        state === PROCESS_MESSAGES.READY_TRX_TAX_REPORT ||
        state === PROCESS_MESSAGES.ERROR_TRX_TAX_REPORT
      ) {
        showTrxTaxReportNotification(mess)
      }
      if (
        state === PROCESS_MESSAGES.READY_SYNC ||
        state === PROCESS_MESSAGES.ERROR_SYNC
      ) {
        showSyncNotification(mess)
      }
    } catch (err) {
      console.error(err)
    }
  })
}
