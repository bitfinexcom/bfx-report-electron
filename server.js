'use strict'

const fs = require('fs/promises')
const { pick } = require('lib-js-util-base')
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
const pathToConfReportService = path.join(pathToConfDir, 'service.report.json')
const confReportService = require(pathToConfReportService)

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
  serializeError
} = require('./src/helpers')

const {
  WrongPathToUserDataError,
  WrongPathToUserReportFilesError,
  WrongSecretKeyError
} = require('./src/errors')

const emitter = new EventEmitter()

const _getAllowedStatesSet = ({
  allStates,
  availableStates
}) => {
  const pickedStates = pick(
    allStates,
    availableStates
  )

  return new Set(Object.values(pickedStates))
}

const allowedProcessMessagesSet = _getAllowedStatesSet({
  allStates: PROCESS_MESSAGES,
  availableStates: [
    'ERROR_WORKER',

    'READY_MIGRATIONS',
    'ERROR_MIGRATIONS',

    'READY_TRX_TAX_REPORT',
    'ERROR_TRX_TAX_REPORT',

    'READY_SYNC',
    'ERROR_SYNC',

    'ALL_TABLE_HAVE_BEEN_CLEARED',
    'ALL_TABLE_HAVE_NOT_BEEN_CLEARED',

    'ALL_TABLE_HAVE_BEEN_REMOVED',
    'ALL_TABLE_HAVE_NOT_BEEN_REMOVED',

    'BACKUP_PROGRESS',
    'BACKUP_FINISHED',
    'ERROR_BACKUP',

    'DB_HAS_BEEN_RESTORED',
    'DB_HAS_NOT_BEEN_RESTORED',

    'REQUEST_MIGRATION_HAS_FAILED_WHAT_SHOULD_BE_DONE',
    'REQUEST_SHOULD_ALL_TABLES_BE_REMOVED',

    'RESPONSE_GET_BACKUP_FILES_METADATA',

    'RESPONSE_UPDATE_USERS_SYNC_ON_STARTUP_REQUIRED_STATE',

    'REQUEST_PDF_CREATION'
  ]
})
const allowedProcessStatesSet = _getAllowedStatesSet({
  allStates: PROCESS_STATES,
  availableStates: [
    'CLEAR_ALL_TABLES',
    'REMOVE_ALL_TABLES',

    'RESTORE_DB',
    'BACKUP_DB',

    'RESPONSE_MIGRATION_HAS_FAILED_WHAT_SHOULD_BE_DONE',

    'REQUEST_GET_BACKUP_FILES_METADATA',

    'REQUEST_UPDATE_USERS_SYNC_ON_STARTUP_REQUIRED_STATE',

    'RESPONSE_PDF_CREATION'
  ]
})

;(async () => {
  try {
    const pathToUserData = process.env.PATH_TO_USER_DATA
    const pathToUserReportFiles = process.env.PATH_TO_USER_REPORT_FILES
    const schedulerRule = process.env.SCHEDULER_RULE
    const secretKey = process.env.SECRET_KEY
    const grape1DhtPort = process.env.GRAPE_1DHT_PORT
    const grape1ApiPort = process.env.GRAPE_1API_PORT
    const grape2DhtPort = process.env.GRAPE_2DHT_PORT
    const grape2ApiPort = process.env.GRAPE_2API_PORT
    const workerApiPort = process.env.WORKER_API_PORT
    const workerWsPort = process.env.WORKER_WS_PORT
    const expressApiPort = process.env.EXPRESS_API_PORT
    const bfxMockedApiPort = process.env.BFX_MOCKED_API_PORT

    if (!secretKey) {
      throw new WrongSecretKeyError()
    }
    if (!pathToUserData) {
      throw new WrongPathToUserDataError()
    }
    if (!pathToUserReportFiles) {
      throw new WrongPathToUserReportFilesError()
    }

    const grape = `http://127.0.0.1:${grape2ApiPort}`

    confFacsGrc.p0.grape = grape
    confFacsGrc.p1.grape = grape

    process.env.NODE_CONFIG = JSON.stringify({
      app: {
        port: expressApiPort,
        httpRpcTimeout: 10 * 60 * 1000,
        wsRpcTimeout: 10 * 60 * 1000
      },
      grenacheClient: {
        grape
      }
    })

    confReportService.restUrl = `http://127.0.0.1:${bfxMockedApiPort}`
    await fs.writeFile(
      pathToConfReportService,
      JSON.stringify(confReportService, null, 2)
    )
    const mockedBfxApiPath = path.join(__dirname, 'mockedBfxApi.js')
    const mockedBfxApiIpc = fork(mockedBfxApiPath, [], {
      env,
      cwd: process.cwd(),
      silent: false
    })
    mockedBfxApiIpc.on('close', () => {
      process.nextTick(() => {
        process.exit(0)
      })
    })
    await new Promise((resolve, reject) => {
      const handlerMess = (mess) => {
        const { state } = mess ?? {}

        if (state !== 'MOCKED_BFX_API_READY') {
          return
        }

        mockedBfxApiIpc.removeListener('error', handlerErr)
        mockedBfxApiIpc.removeListener('message', handlerMess)

        resolve()
      }
      const handlerErr = (err) => {
        mockedBfxApiIpc.removeListener('message', handlerMess)

        reject(err)
      }

      mockedBfxApiIpc.once('error', handlerErr)
      mockedBfxApiIpc.on('message', handlerMess)
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
      `--reportFolder=${pathToUserReportFiles}`,
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

      if (!allowedProcessMessagesSet.has(state)) {
        return
      }

      process.send(mess)
    })
    process.on('message', (mess) => {
      const { state } = { ...mess }

      if (!allowedProcessStatesSet.has(state)) {
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
