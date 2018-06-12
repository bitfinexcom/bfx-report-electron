'use strict'

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production'

const express = require('express')
const app = express()
const config = require('config')
const morgan = require('morgan')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')

module.exports = { app }

const { headersMiddleware } = require('./src/middlewares')
const { corsService, logDebugService, logService } = require('./src/services')
const responses = require('./src/services/helpers/responses')
const { logger } = logService

const routes = require('./src/routes')

const port = config.get('app.port')
const host = config.get('app.host')

app.use(corsService.corsBase())
app.use(headersMiddleware)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride())

if (
  config.has('logDebug.enableServerStream') &&
  config.get('logDebug.enableServerStream')
) {
  app.use(
    morgan('combined', {
      stream: { write: msg => logDebugService.debug(msg) }
    })
  )
}

app.use('/', routes)

app.use((req, res, next) => {
  responses.failure(404, 'Not found', res)
})

app.use((err, req, res, next) => {
  logger.error('Found %s at %s', 'error', err)
  responses.failure(
    err.statusCode ? err.statusCode : 500,
    err.message || err.statusMessage || 'Internal Server Error',
    res
  )
})

const server = app.listen(port, host, () => {
  const host = server.address().address
  const port = server.address().port

  logger.info(`Server listening on host ${host} port ${port}`)
  app.emit('listened', server)
})
