'use strict'

const { fork } = require('child_process')
const path = require('path')

const ipcs = require('./ipcs')

const serverPath = path.join(__dirname, '../server.js')

module.exports = ({
  pathToUserData,
  pathToUserDocuments,
  secretKey
}) => {
  const env = {
    ...process.env,
    ELECTRON_VERSION: process.versions.electron,
    PATH_TO_USER_DATA: pathToUserData,
    PATH_TO_USER_DOCUMENTS: pathToUserDocuments,
    SECRET_KEY: secretKey
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
