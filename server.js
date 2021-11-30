'use strict'

const { fork } = require('child_process')
const path = require('path')
const EventEmitter = require('events')
const { grapes: createGrapes } = require('bfx-svc-test-helper')

const root = path.join(__dirname, 'bfx-reports-framework')
const expressRoot = path.join(__dirname, 'bfx-report-ui/bfx-report-express')
const pathToExpressConfDir = path.join(expressRoot, 'config')
const pathToConfDir = path.join(root, 'config')
const pathToConfFacs = path.join(pathToConfDir, 'facs')
const pathToConfFacsGrc = path.join(pathToConfFacs, 'grc.config.json')
const confFacsGrc = require(pathToConfFacsGrc)

const PROCESS_MESSAGES = require(
  './bfx-reports-framework/workers/loc.api/process.message.manager/process.messages'
)
const PROCESS_STATES = require(
  './bfx-reports-framework/workers/loc.api/process.message.manager/process.states'
)

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production'
process.send = process.send || (() => {})
process.env.NODE_CONFIG_DIR = pathToExpressConfDir

const env = { ...process.env }
const {
  getDefaultPorts,
  getFreePort,
  serializeError
} = require('./src/helpers')

const {
  RunningExpressOnPortError,
  WrongPathToUserDataError,
  WrongPathToUserCsvError,
  WrongSecretKeyError
} = require('./src/errors')

const emitter = new EventEmitter()

;(async () => {
  try {
    const pathToUserData = process.env.PATH_TO_USER_DATA
    const pathToUserCsv = process.env.PATH_TO_USER_CSV
    const schedulerRule = process.env.SCHEDULER_RULE
    const secretKey = process.env.SECRET_KEY

    if (!secretKey) {
      throw new WrongSecretKeyError()
    }
    if (!pathToUserData) {
      throw new WrongPathToUserDataError()
    }
    if (!pathToUserCsv) {
      throw new WrongPathToUserCsvError()
    }

    const defaultPorts = getDefaultPorts()
    const {
      grape1DhtPort,
      grape1ApiPort,
      grape2DhtPort,
      grape2ApiPort,
      workerApiPort,
      workerWsPort,
      expressApiPort
    } = await getFreePort(defaultPorts)
    const grape = `http://127.0.0.1:${grape2ApiPort}`

    confFacsGrc.p0.grape = grape
    confFacsGrc.p1.grape = grape

    if (defaultPorts.expressApiPort !== expressApiPort) {
      process.send({
        state: 'error:express-port-required',
        err: serializeError(new RunningExpressOnPortError())
      })

      return
    }

    process.env.NODE_CONFIG = JSON.stringify({
      app: {
        port: expressApiPort
      },
      grenacheClient: {
        grape
      }
    })

    const confGrape1 = {
      dht_port: grape1DhtPort,
      dht_bootstrap: [`127.0.0.1:${grape2DhtPort}`],
      api_port: grape1ApiPort
    }
    const confGrape2 = {
      dht_port: grape2DhtPort,
      dht_bootstrap: [`127.0.0.1:${grape1DhtPort}`],
      api_port: grape2ApiPort
    }
    const grapes = createGrapes({
      ports: [confGrape1, confGrape2]
    })
    await grapes.start()

    const modulePath = path.join(root, 'worker.js')

    const ipc = fork(modulePath, [
      `--env=${process.env.NODE_ENV}`,
      '--wtype=wrk-report-framework-api',
      `--apiPort=${workerApiPort}`,
      `--wsPort=${workerWsPort}`,
      '--dbId=1',
      '--isSchedulerEnabled=true',
      '--isElectronjsEnv=true',
      '--isLoggerDisabled=false',
      `--csvFolder=${pathToUserCsv}`,
      `--tempFolder=${pathToUserData}/temp`,
      `--logsFolder=${pathToUserData}/logs`,
      `--dbFolder=${pathToUserData}`,
      `--grape=${grape}`,
      `--secretKey=${secretKey}`,
      `--schedulerRule=${schedulerRule || ''}`
    ], {
      env,
      cwd: process.cwd(),
      silent: false
    })
    ipc.on('close', () => {
      grapes.stop(() => {
        process.nextTick(() => {
          process.exit(0)
        })
      })
    })

    ipc.on('message', (mess) => {
      const { state } = { ...mess }

      if (
        state !== PROCESS_MESSAGES.ERROR_WORKER &&

        state !== PROCESS_MESSAGES.READY_MIGRATIONS &&
        state !== PROCESS_MESSAGES.ERROR_MIGRATIONS &&

        state !== PROCESS_MESSAGES.ALL_TABLE_HAVE_BEEN_CLEARED &&
        state !== PROCESS_MESSAGES.ALL_TABLE_HAVE_NOT_BEEN_CLEARED &&

        state !== PROCESS_MESSAGES.ALL_TABLE_HAVE_BEEN_REMOVED &&
        state !== PROCESS_MESSAGES.ALL_TABLE_HAVE_NOT_BEEN_REMOVED &&

        state !== PROCESS_MESSAGES.BACKUP_PROGRESS &&
        state !== PROCESS_MESSAGES.BACKUP_FINISHED &&
        state !== PROCESS_MESSAGES.ERROR_BACKUP &&

        state !== PROCESS_MESSAGES.DB_HAS_BEEN_RESTORED &&
        state !== PROCESS_MESSAGES.DB_HAS_NOT_BEEN_RESTORED &&

        state !== PROCESS_MESSAGES.REQUEST_MIGRATION_HAS_FAILED_WHAT_SHOULD_BE_DONE &&
        state !== PROCESS_MESSAGES.REQUEST_SHOULD_ALL_TABLES_BE_REMOVED &&

        state !== PROCESS_MESSAGES.RESPONSE_GET_BACKUP_FILES_METADATA
      ) {
        return
      }

      process.send(mess)
    })
    process.on('message', (mess) => {
      const { state } = { ...mess }

      if (
        state !== PROCESS_STATES.CLEAR_ALL_TABLES &&
        state !== PROCESS_STATES.REMOVE_ALL_TABLES &&

        state !== PROCESS_STATES.RESTORE_DB &&
        state !== PROCESS_STATES.BACKUP_DB &&

        state !== PROCESS_STATES.RESPONSE_MIGRATION_HAS_FAILED_WHAT_SHOULD_BE_DONE &&

        state !== PROCESS_STATES.REQUEST_GET_BACKUP_FILES_METADATA
      ) {
        return
      }

      ipc.send(mess)
    })

    const announcePromise = grapes.onAnnounce('rest:report:api')
    const ipcReadyPromise = new Promise((resolve, reject) => {
      const handlerMess = (mess) => {
        const { state } = { ...mess }

        if (state !== PROCESS_MESSAGES.READY_WORKER) {
          return
        }

        ipc.removeListener('error', handlerErr)
        ipc.removeListener('message', handlerMess)

        resolve()
      }
      const handlerErr = (err) => {
        ipc.removeListener('message', handlerMess)

        reject(err)
      }

      ipc.once('error', handlerErr)
      ipc.on('message', handlerMess)
    })

    await Promise.all([announcePromise, ipcReadyPromise])

    emitter.emit('ready:grapes-worker', { ipc, grapes })

    process.on('SIGINT', () => ipc && ipc.kill())
    process.on('SIGHUP', () => ipc && ipc.kill())
    process.on('SIGTERM', () => ipc && ipc.kill())
  } catch (err) {
    process.send({
      state: 'error:app-init',
      err: serializeError(err)
    })
  }
})()

emitter.once('ready:grapes-worker', () => {
  try {
    const { app } = require(expressRoot)

    app.once('listened', server => {
      emitter.emit('ready:server', server)
    })
  } catch (err) {
    process.send({
      state: 'error:app-init',
      err: serializeError(err)
    })
  }
})

emitter.once('ready:server', () => {
  process.send({ state: 'ready:server' })
})

module.exports = emitter
