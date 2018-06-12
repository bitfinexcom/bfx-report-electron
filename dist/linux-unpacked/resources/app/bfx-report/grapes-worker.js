'use strict'

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production'

const { spawn } = require('child_process')
const path = require('path')
const EventEmitter = require('events')
require('config')

const { bootTwoGrapes, killGrapes } = require('./workers/grenache.helper')

const emitter = new EventEmitter()
let rpc = null
let grapes = null

bootTwoGrapes((err, g) => {
  if (err) throw err

  grapes = g

  const modulePath = path.join(__dirname, 'worker.js')

  rpc = spawn('node', [
    modulePath,
    `--env=${process.env.NODE_ENV}`,
    '--wtype=wrk-report-service-api',
    '--apiPort=1337'
  ])
  rpc.stdout.on('data', d => {
    console.log(d.toString())
  })
  rpc.stderr.on('data', d => {
    console.log(d.toString())
  })
  rpc.on('close', () => {
    killGrapes(grapes, () => {
      process.nextTick(() => {
        process.exit(0)
      })
    })
  })
  grapes[0].once('announce', () => {
    emitter.emit('ready:grapes-worker', { rpc, grapes })
  })
})

const _processExit = () => {
  rpc.kill()
}

process.on('SIGINT', () => _processExit())
process.on('SIGHUP', () => _processExit())
process.on('SIGTERM', () => _processExit())

module.exports = {
  rpc,
  grapes,
  emitter
}
