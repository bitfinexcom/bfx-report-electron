'use strict'

const { fork } = require('child_process')
const path = require('path')
const { writeFileSync } = require('fs')
const EventEmitter = require('events')

const root = path.join(__dirname, 'bfx-reports-framework')
const expressRoot = path.join(__dirname, 'bfx-report-ui/bfx-report-express')
const pathToExpressConfDir = path.join(expressRoot, 'config')
const pathToConfDir = path.join(root, 'config')
const pathToConfFacs = path.join(pathToConfDir, 'facs')
const pathToConfFacsGrc = path.join(pathToConfFacs, 'grc.config.json')
const confFacsGrc = require(pathToConfFacsGrc)

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production'
process.send = process.send || (() => {})
process.env.NODE_CONFIG_DIR = pathToExpressConfDir
process.versions.electron = process.env.ELECTRON_VERSION

const env = {
  ...process.env,
  ELECTRON_VERSION: process.versions.electron
}
const isNotDevEnv = process.env.NODE_ENV !== 'development'

const {
  bootTwoGrapes,
  killGrapes,
  getDefaultPorts,
  getFreePort,
  checkAndChangeAccess
} = require('./src/helpers')

const {
  RunningExpressOnPortError
} = require('./src/errors')

const emitter = new EventEmitter()

let isMigrationsReady = false
let isMigrationsError = false

;(async () => {
  try {
    const defaultPorts = getDefaultPorts()
    const ports = await getFreePort(defaultPorts)
    const grape = `http://127.0.0.1:${ports.grape2ApiPort}`

    confFacsGrc.p0.grape = grape
    confFacsGrc.p1.grape = grape

    if (defaultPorts.expressApiPort !== ports.expressApiPort) {
      process.send({
        state: 'error:express-port-required',
        err: new RunningExpressOnPortError()
      })

      return
    }

    checkAndChangeAccess(pathToConfFacs)
    checkAndChangeAccess(pathToConfFacsGrc)
    writeFileSync(pathToConfFacsGrc, JSON.stringify(confFacsGrc))

    process.env.NODE_CONFIG = JSON.stringify({
      app: {
        port: ports.expressApiPort
      },
      grenacheClient: {
        grape
      }
    })

    const grapes = await bootTwoGrapes(ports)

    const modulePath = path.join(root, 'worker.js')

    const ipc = fork(modulePath, [
      `--env=${process.env.NODE_ENV}`,
      '--wtype=wrk-report-framework-api',
      `--apiPort=${ports.workerApiPort}`,
      `--wsPort=${ports.workerWsPort}`,
      '--dbId=1',
      '--csvFolder=../../../csv',
      '--isSchedulerEnabled=true',
      '--isElectronjsEnv=true',
      `--isLoggerDisabled=${isNotDevEnv}`
    ], {
      env,
      cwd: process.cwd(),
      silent: false
    })
    ipc.on('close', () => {
      killGrapes(grapes, () => {
        process.nextTick(() => {
          process.exit(0)
        })
      })
    })

    const announcePromise = new Promise((resolve, reject) => {
      grapes[0].once('error', reject)
      grapes[1].once('error', reject)

      let count = 0

      const handler = () => {
        count += 1

        if (count < 2) return

        grapes[0].removeListener('error', reject)
        grapes[0].removeListener('announce', handler)
        grapes[1].removeListener('error', reject)

        resolve()
      }

      grapes[0].on('announce', handler)
    })
    const ipcReadyPromise = new Promise((resolve, reject) => {
      ipc.once('error', reject)

      const handler = (mess) => {
        const { state } = { ...mess }

        if (state === 'error:migrations') {
          isMigrationsError = true
        }
        if (state === 'ready:migrations') {
          isMigrationsReady = true
        }
        if (state !== 'ready:worker') {
          return
        }

        ipc.removeListener('error', reject)
        ipc.removeListener('message', handler)

        resolve()
      }

      ipc.on('message', handler)
    })

    await Promise.all([announcePromise, ipcReadyPromise])

    emitter.emit('ready:grapes-worker', { ipc, grapes })

    process.on('SIGINT', () => ipc && ipc.kill())
    process.on('SIGHUP', () => ipc && ipc.kill())
    process.on('SIGTERM', () => ipc && ipc.kill())
  } catch (err) {
    process.send({ state: 'error:app-init', err })
  }
})()

emitter.once('ready:grapes-worker', () => {
  try {
    const { app } = require(expressRoot)

    app.once('listened', server => {
      emitter.emit('ready:server', server)
    })
  } catch (err) {
    process.send({ state: 'error:app-init', err })
  }
})

emitter.once('ready:server', () => {
  process.send({
    state: 'ready:server',
    isMigrationsError,
    isMigrationsReady
  })
})

module.exports = emitter
