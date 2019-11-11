'use strict'

const {
  bootTwoGrapes,
  killGrapes
} = require('./grapes')
const {
  getFreePort,
  getDefaultPorts
} = require('./ports')
const {
  checkAndChangeAccess
} = require('./utils')
const windowStateKeeper = require('./window-state-keeper')
const exportDB = require('./export-db')
const importDB = require('./import-db')
const windows = require('./windows')
const ipcs = require('./ipcs')
const runServer = require('./run-server')
const createMenu = require('./create-menu')
const pauseApp = require('./pause-app')
const relaunch = require('./relaunch')
const appStates = require('./app-states')
const {
  createMainWindow,
  createLoadingWindow,
  createErrorWindow
} = require('./window-creators')
const initializeApp = require('./initialize-app')
const makeSingleInstance = require('./make-single-instance')
const showErrorModalDialog = require('./show-error-modal-dialog')
const showMessageModalDialog = require('./show-message-modal-dialog')
const {
  zip,
  unzip
} = require('./archiver')
const {
  showLoadingWindow,
  hideLoadingWindow
} = require('./change-loading-win-visibility-state')

module.exports = {
  bootTwoGrapes,
  killGrapes,
  getFreePort,
  getDefaultPorts,
  checkAndChangeAccess,
  windowStateKeeper,
  exportDB,
  importDB,
  windows,
  ipcs,
  runServer,
  createMenu,
  pauseApp,
  relaunch,
  appStates,
  createMainWindow,
  createLoadingWindow,
  createErrorWindow,
  initializeApp,
  makeSingleInstance,
  showErrorModalDialog,
  showMessageModalDialog,
  zip,
  unzip,
  showLoadingWindow,
  hideLoadingWindow
}
