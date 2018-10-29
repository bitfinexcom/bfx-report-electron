'use strict'

const { fork } = require('child_process')
const path = require('path')
const { writeFileSync } = require('fs')
const EventEmitter = require('events')

const root = path.join(__dirname, 'bfx-report')
const pathToConfDir = path.join(root, 'config')
const pathToConfFacs = path.join(pathToConfDir, 'facs')
const pathToConfFacsGrc = path.join(pathToConfFacs, 'grc.config.json')
const confFacsGrc = require(pathToConfFacsGrc)

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production'
process.send = process.send || (() => {})
process.env.NODE_CONFIG_DIR = pathToConfDir
process.versions.electron = process.env.ELECTRON_VERSION

const env = {
  ...process.env,
  ELECTRON_VERSION: process.versions.electron
}

const {
  bootTwoGrapes,
  killGrapes,
  getDefaultPorts,
  getFreePort,
  checkAndChangeAccess
} = require('./helpers')

const emitter = new EventEmitter()
let ipc = null
let grapes = null

void (async () => {
  try {
    const defaultPorts = getDefaultPorts()
    const ports = await getFreePort(defaultPorts)
    const grape = `http://127.0.0.1:${ports.grape2ApiPort}`

    confFacsGrc.p0.grape = grape
    confFacsGrc.p1.grape = grape

    if (defaultPorts.expressApiPort !== ports.expressApiPort) {
      process.send({ state: 'error:express-port-required' })

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

    bootTwoGrapes(ports, (err, g) => {
      if (err) throw err

      grapes = g

      const modulePath = path.join(root, 'worker.js')

      ipc = fork(modulePath, [
        `--env=${process.env.NODE_ENV}`,
        '--wtype=wrk-report-service-api',
        `--apiPort=${ports.workerApiPort}`,
        '--dbId=1',
        '--csvFolder=../../../csv',
        '--isSchedulerEnabled=true',
        '--isElectronjsEnv=true'
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
      grapes[0].once('announce', () => {
        emitter.emit('ready:grapes-worker', { ipc, grapes })
      })
    })
  } catch (err) {
    process.send({ state: 'error:app-init' })
  }
})()

process.on('SIGINT', () => ipc && ipc.kill())
process.on('SIGHUP', () => ipc && ipc.kill())
process.on('SIGTERM', () => ipc && ipc.kill())

emitter.once('ready:grapes-worker', () => {
  try {
    const { app } = require(path.join(root, 'app.js'))

    app.once('listened', server => {
      emitter.emit('ready:server', server)
    })
  } catch (err) {
    process.send({ state: 'error:app-init' })
  }
})

emitter.once('ready:server', () => {
  process.send({ state: 'ready:server' })
})

module.exports = emitter
