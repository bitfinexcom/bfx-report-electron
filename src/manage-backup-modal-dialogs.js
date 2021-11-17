'use strict'

const { BrowserWindow } = require('electron')

const ipcs = require('./ipcs')
const relaunch = require('./relaunch')
const showMessageModalDialog = require(
  './show-message-modal-dialog'
)
const showMigrationsModalDialog = require(
  './show-migrations-modal-dialog'
)
const showErrorModalDialog = require(
  './show-error-modal-dialog'
)

module.exports = () => {
  const ipc = ipcs.serverIpc
  const win = BrowserWindow.getFocusedWindow()

  if (!ipc) {
    return
  }

  ipc.on('message', async (mess) => {
    try {
      if (
        !mess ||
        typeof mess !== 'object' ||
        typeof mess.state !== 'string'
      ) {
        return
      }

      const isMigrationsError = mess.state === 'error:migrations'
      const isMigrationsReady = mess.state === 'ready:migrations'

      if (
        isMigrationsError ||
        isMigrationsReady
      ) {
        await showMigrationsModalDialog(
          isMigrationsError,
          isMigrationsReady
        )
        
        return
      }
      if (mess.state === 'error:migrations') {

      }
      if (mess.state === 'request:migration-has-failed:what-should-be-done') {
        const {
          btnId
        } = await showMessageModalDialog(win, {
          type: 'question',
          title: 'The migration has failed',
          message: 'What should be done?',
          buttons: ['Cancel', 'Try to restore DB', 'Remove DB'],
        })

        if (btnId === 0) {
          relaunch()

          return
        }

        console.log('[btnId]:', btnId)

        ipc.send({
          state: 'response:migration-has-failed:what-should-be-done',
          data: {
            shouldRestore: btnId === 1,
            shouldRemove: btnId === 2
          }
        })

        return
      }
    } catch (err) {
      try {
        await showErrorModalDialog(win, 'Unexpected exception', err)
      } catch (err) {
        console.error(err)
      }

      console.error(err)
    }
  })
}
