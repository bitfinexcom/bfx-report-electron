'use strict'

const path = require('path')

process.env.NODE_ENV = 'development'
process.send = process.send || (() => {})
process.env.NODE_CONFIG_DIR = path.join(__dirname, 'bfx-report', 'config')

const bfxReport = require('./bfx-report/index')

bfxReport.once('ready:server', () => {
  process.send({ state: 'ready:server' })
})

module.exports = bfxReport
