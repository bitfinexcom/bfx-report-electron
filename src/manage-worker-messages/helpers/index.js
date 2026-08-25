'use strict'

const ipcReadyMessToPromise = require('./ipc-ready-mess-to-promise')
const resolveModalDialogInSequence = require(
  './resolve-modal-dialog-in-sequence'
)

module.exports = {
  ipcReadyMessToPromise,
  resolveModalDialogInSequence
}
