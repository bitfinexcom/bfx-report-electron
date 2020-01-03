'use strict'

const { fork } = require('child_process')
const path = require('path')
const electron = require('electron')

const ipcs = require('./ipcs')

const serverPath = path.join(__dirname, '../server.js')

module.exports = () => {
  const app = electron.app || electron.remote.app
  const pathToUserData = app.getPath('userData')
  const env = {
    ...process.env,
    ELECTRON_VERSION: process.versions.electron,
    PATH_TO_USER_DATA: pathToUserData
  }
  const ipc = fork(serverPath, [], {
    env,
    cwd: process.cwd(),
    silent: false
  })

  ipcs.serverIpc = ipc
  ipc.once('close', () => {
    ipcs.serverIpc = null
  })

  return ipc
}
