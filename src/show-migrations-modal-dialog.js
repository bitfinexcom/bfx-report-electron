'use strict'

const wins = require('./windows')
const showMessageModalDialog = require('./show-message-modal-dialog')

module.exports = async (
  isMigrationsError,
  isMigrationsReady
) => {
  if (
    !isMigrationsError &&
    !isMigrationsReady
  ) {
    return
  }

  const type = isMigrationsError
    ? 'error'
    : 'info'
  const message = isMigrationsError
    ? 'DВ migration failed, all data has been deleted,\nsynchronization will start from scratch'
    : 'DB migration completed successfully'
  const buttons = isMigrationsError
    ? ['Cancel']
    : ['OK']

  await showMessageModalDialog(
    wins.mainWindow,
    {
      type,
      message,
      buttons,
      defaultId: 0,
      cancelId: 0
    }
  )
}
