'use strict'

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production'

const { emitter } = require('./grapes-worker')

emitter.once('ready:grapes-worker', param => {
  const { app } = require('./app')

  app.once('listened', server => {
    emitter.emit('ready:server', server)
  })
})

module.exports = emitter
