'use strict'

const { fork } = require('child_process')
const path = require('path')
const EventEmitter = require('events')

const root = path.join(__dirname, 'bfx-report')

process.env.NODE_ENV = 'production'
process.send = process.send || (() => {})
process.env.NODE_CONFIG_DIR = path.join(root, 'config')

const { Grape } = require('grenache-grape')
const waterfall = require('async/waterfall')

const confGrape1 = {
  dht_port: 20002,
  dht_bootstrap: ['127.0.0.1:20001'],
  api_port: 40001
}
const confGrape2 = {
  dht_port: 20001,
  dht_bootstrap: ['127.0.0.1:20002'],
  api_port: 30001
}

const emitter = new EventEmitter()
let ipc = null
let grapes = null

const bootTwoGrapes = cb => {
  const grape1 = new Grape(confGrape1)
  const grape2 = new Grape(confGrape2)

  waterfall(
    [
      cb => {
        grape1.start()
        grape1.once('ready', cb)
      },
      cb => {
        grape2.start()
        grape2.once('node', cb)
      }
    ],
    () => {
      cb(null, [grape1, grape2])
    }
  )
}

const killGrapes = (grapes, done = () => {}) => {
  grapes[0].stop(err => {
    if (err) throw err
    grapes[1].stop(err => {
      if (err) throw err
      done()
    })
  })
}

bootTwoGrapes((err, g) => {
  if (err) throw err

  grapes = g

  const modulePath = path.join(root, 'worker.js')

  ipc = fork(modulePath, [
    `--env=${process.env.NODE_ENV}`,
    '--wtype=wrk-report-service-api',
    '--apiPort=1337'
  ], {
    cwd: process.cwd(),
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
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

const _processExit = () => {
  ipc.kill()
}

process.on('SIGINT', () => _processExit())
process.on('SIGHUP', () => _processExit())
process.on('SIGTERM', () => _processExit())

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
