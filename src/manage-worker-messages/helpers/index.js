'use strict'

const ipcReadyMessToPromise = require('./ipc-ready-mess-to-promise')
const resolveModalDialogInSequence = require(
  './resolve-modal-dialog-in-sequence'
)
const getParentWindow = require('./get-parent-window')

module.exports = {
  ipcReadyMessToPromise,
  resolveModalDialogInSequence,
  getParentWindow
}
