'use strict'

const fs = require('fs')
const path = require('path')
const { Grape } = require('grenache-grape')
const waterfall = require('async/waterfall')
const fp = require('find-free-port')
const DHT = require('bittorrent-dht')

const ports = {
  grape1DhtPort: 20002,
  grape1ApiPort: 40001,
  grape2DhtPort: 20001,
  grape2ApiPort: 30001,
  workerApiPort: 1337,
  expressApiPort: 31339
}

const getDefaultPorts = () => {
  return { ...ports }
}

const _asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const _checkPortsUniq = (port, ports = {}) => {
  return Object.entries(ports).every(([key, nextPort]) => port !== nextPort)
}

const getFreePort = async (ports = {}) => {
  const res = {}

  await _asyncForEach(Object.entries(ports), async ([key, port]) => {
    let count = 0

    while (true) {
      count += 1

      if (count > 100) throw new Error('NO_FREE_PORT')

      const freePort = (await fp(port, '127.0.0.1'))[0]
      if (/dht/i.test(key)) {
        const dht = new DHT()

        try {
          await new Promise((resolve, reject) => {
            dht.once('error', (err) => {
              dht.removeListener('listening', resolve)
              reject(err)
            })
            dht.once('listening', () => {
              dht.removeListener('error', reject)
              resolve()
            })
            dht.listen(port)
          })

          dht.destroy()
        } catch (err) {
          port += 1
          dht.destroy()

          continue
        }
      }

      if (_checkPortsUniq(freePort, res)) {
        res[key] = freePort

        break
      }

      port += 1
    }
  })

  return res
}

const checkAndChangeAccess = (path) => {
  try {
    fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK)
  } catch (err) {
    fs.chmodSync(path, '766')
  }
}

const findAndReplacePortInFrontend = (root, port) => {
  const pathToJsDir = path.join(root, 'build/static/js')
  const files = fs.readdirSync(pathToJsDir)
  files.some(file => {
    if (/^main.*\.js$/.test(file)) {
      const pathToFile = path.join(pathToJsDir, file)
      const str = fs.readFileSync(pathToFile, 'utf8')
      const res = str.replace(/API_URL:["|']http:\/\/localhost:\d+\/api["|']/g, `API_URL:"http://localhost:${port}/api"`)
      fs.writeFileSync(pathToFile, res, 'utf8')
    }
  })
}

const bootTwoGrapes = (locPorts = ports, cb) => {
  const confGrape1 = {
    dht_port: locPorts.grape1DhtPort,
    dht_bootstrap: [`127.0.0.1:${locPorts.grape2DhtPort}`],
    api_port: locPorts.grape1ApiPort
  }
  const confGrape2 = {
    dht_port: locPorts.grape2DhtPort,
    dht_bootstrap: [`127.0.0.1:${locPorts.grape1DhtPort}`],
    api_port: locPorts.grape2ApiPort
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
  killGrapes,
  getFreePort,
  getDefaultPorts,
  checkAndChangeAccess,
  findAndReplacePortInFrontend
}
