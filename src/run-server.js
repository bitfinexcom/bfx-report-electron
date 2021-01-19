'use strict'

const { fork } = require('child_process')
const path = require('path')

const ipcs = require('./ipcs')
const { getConfigsKeeperByName } = require('./configs-keeper')

const serverPath = path.join(__dirname, '../server.js')

module.exports = ({
  pathToUserData,
  secretKey
}) => {
  const mainConfsKeeper = getConfigsKeeperByName('main')
  const env = {
    ...process.env,
    PATH_TO_USER_DATA: pathToUserData,
    PATH_TO_USER_CSV: mainConfsKeeper
      .getConfigByName('pathToUserCsv'),
    SCHEDULER_RULE: mainConfsKeeper
      .getConfigByName('schedulerRule'),
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
