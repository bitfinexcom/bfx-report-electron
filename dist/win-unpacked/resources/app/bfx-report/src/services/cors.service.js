'use strict'

const cors = require('cors')
const config = require('config')

const enable =
  config.has('app.cors') &&
  config.has('app.cors.enable') &&
  config.get('app.cors.enable')

const corsBase = () => {
  if (!enable) {
    return (req, res, next) => next()
  }

  const corsOptions = {
    origin: true,
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
  }

  return cors(corsOptions)
}

module.exports = {
  corsBase
}
