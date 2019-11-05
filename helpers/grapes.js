'use strict'

const { Grape } = require('grenache-grape')
const waterfall = require('async/waterfall')

const bootTwoGrapes = (locPorts = ports) => {
  const {
    grape1DhtPort,
    grape2DhtPort,
    grape1ApiPort,
    grape2ApiPort
  } = { ...locPorts }

  return new Promise((resolve, reject) => {
    const confGrape1 = {
      dht_port: grape1DhtPort,
      dht_bootstrap: [`127.0.0.1:${grape2DhtPort}`],
      api_port: grape1ApiPort
    }
    const confGrape2 = {
      dht_port: grape2DhtPort,
      dht_bootstrap: [`127.0.0.1:${grape1DhtPort}`],
      api_port: grape2ApiPort
    }

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
      (err) => {
        if (err) reject(err)

        resolve([grape1, grape2])
      }
    )
  })
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
