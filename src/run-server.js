'use strict'

const { fork } = require('child_process')
const path = require('path')

const ipcs = require('./ipcs')
const { getConfigsKeeperByName } = require('./configs-keeper')
const { rootPath, serverCwd } = require('./helpers/root-path')

const serverPath = path.join(
  rootPath,
  'server.js'
)

module.exports = ({
  pathToUserData,
  secretKey,
  portsMap
}) => {
  const mainConfsKeeper = getConfigsKeeperByName()
  const {
    grape1DhtPort,
    grape1ApiPort,
    grape2DhtPort,
    grape2ApiPort,
    workerApiPort,
    workerWsPort,
    expressApiPort
  } = portsMap

  const env = {
    ...process.env,
    NODE_PATH: path.join(rootPath, 'node_modules'),
    PATH_TO_USER_DATA: pathToUserData,
    PATH_TO_USER_REPORT_FILES: mainConfsKeeper
      .getConfigByName('pathToUserReportFiles'),
    SCHEDULER_RULE: mainConfsKeeper
      .getConfigByName('schedulerRule'),
    SECRET_KEY: secretKey,
    GRAPE_1DHT_PORT: grape1DhtPort,
    GRAPE_1API_PORT: grape1ApiPort,
    GRAPE_2DHT_PORT: grape2DhtPort,
    GRAPE_2API_PORT: grape2ApiPort,
    WORKER_API_PORT: workerApiPort,
    WORKER_WS_PORT: workerWsPort,
    EXPRESS_API_PORT: expressApiPort
  }
  const ipc = fork(serverPath, [], {
    env,
    cwd: serverCwd,
    silent: false,
    execPath: process.execPath
  })

  ipcs.serverIpc = ipc
  ipc.once('close', () => {
    ipcs.serverIpc = null
  })

  return ipc
}
