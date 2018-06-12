'use strict'

const { Grape } = require('grenache-grape')
const waterfall = require('async/waterfall')
const config = require('config')

const _checkConf = () => {
  if (
    config.has('grenacheService') &&
    config.has('grenacheService.grape1') &&
    config.has('grenacheService.grape2') &&
    config.has('grenacheService.grape1.dht_port') &&
    config.has('grenacheService.grape1.dht_bootstrap') &&
    Array.isArray(config.get('grenacheService.grape1.dht_bootstrap')) &&
    config.get('grenacheService.grape1.dht_bootstrap').length > 0 &&
    config.has('grenacheService.grape1.api_port') &&
    config.has('grenacheService.grape2.dht_port') &&
    Array.isArray(config.get('grenacheService.grape2.dht_bootstrap')) &&
    config.get('grenacheService.grape2.dht_bootstrap').length > 0 &&
    config.has('grenacheService.grape2.api_port')
  ) {
    return
  }

  const err = new Error('ERR_CONFIG_ARGS_NO_GRAPES')

  throw err
}

_checkConf()

const confGrape1 = { ...config.get('grenacheService.grape1') }
const confGrape2 = { ...config.get('grenacheService.grape2') }

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

module.exports = {
  bootTwoGrapes,
  killGrapes
}
