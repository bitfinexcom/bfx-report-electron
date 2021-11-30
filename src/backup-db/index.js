'use strict'

const { app } = require('electron')

const ipcs = require('../ipcs')
const isMainWinAvailable = require(
  '../helpers/is-main-win-available'
)

const PROCESS_STATES = require(
  '../../bfx-reports-framework/workers/loc.api/process.message.manager/process.states'
)

module.exports = () => {
  return () => {
    try {
      if (
        !app.isReady() ||
        !isMainWinAvailable()
      ) {
        return
      }

      ipcs.serverIpc.send({ state: PROCESS_STATES.BACKUP_DB })
    } catch (err) {
      console.error(err)
    }
  }
}
