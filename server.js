'use strict'

const { fork } = require('child_process')
const path = require('path')
const { writeFileSync } = require('fs')
const EventEmitter = require('events')

const root = path.join(__dirname, 'bfx-report')
const rootUI = path.join(__dirname, 'bfx-report-ui')
const pathToConfDir = path.join(root, 'config')
const pathToConfFacs = path.join(pathToConfDir, 'facs')
const pathToConfFacsGrc = path.join(pathToConfFacs, 'grc.config.json')
const confFacsGrc = require(pathToConfFacsGrc)

process.env.NODE_ENV = 'production'
process.send = process.send || (() => {})
process.env.NODE_CONFIG_DIR = pathToConfDir

const {
  bootTwoGrapes,
  killGrapes,
  getDefaultPorts,
  getFreePort,
  checkAndChangeAccess,
  findAndReplacePortInFrontend
} = require('./helpers')

const emitter = new EventEmitter()
let ipc = null
let grapes = null

void (async () => {
  const defaultPorts = getDefaultPorts()
  const ports = await getFreePort(defaultPorts)
  console.log('---ports---', ports) // TODO:
  const grape = `http://127.0.0.1:${ports.grape2ApiPort}`

  confFacsGrc.p0.grape = grape
  confFacsGrc.p1.grape = grape

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

  findAndReplacePortInFrontend(rootUI, ports.expressApiPort)

  bootTwoGrapes(ports, (err, g) => {
    if (err) throw err

    grapes = g

    const modulePath = path.join(root, 'worker.js')

    ipc = fork(modulePath, [
      `--env=${process.env.NODE_ENV}`,
      '--wtype=wrk-report-service-api',
      `--apiPort=${ports.workerApiPort}`,
      '--dbID=1',
      '--csvFolder=../../../csv'
    ], {
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
})()

process.on('SIGINT', () => ipc && ipc.kill())
process.on('SIGHUP', () => ipc && ipc.kill())
process.on('SIGTERM', () => ipc && ipc.kill())

emitter.once('ready:grapes-worker', () => {
  const { app } = require(path.join(root, 'app.js'))

  app.once('listened', server => {
    emitter.emit('ready:server', server)
  })
})

emitter.once('ready:server', () => {
  process.send({ state: 'ready:server' })
})

module.exports = emitter
