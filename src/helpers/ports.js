'use strict'

const fp = require('find-free-port')
const DHT = require('bittorrent-dht')

const getDefaultPorts = () => {
  return {
    grape1DhtPort: 20002,
    grape1ApiPort: 40001,
    grape2DhtPort: 20001,
    grape2ApiPort: 30001,
    workerApiPort: 1337,
    workerWsPort: 1455,
    expressApiPort: 34343
  }
}

const _asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const _checkPortsUniq = (port, ports = {}) => {
  return Object.entries(ports)
    .every(([key, nextPort]) => port !== nextPort)
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

module.exports = {
  getDefaultPorts,
  getFreePort
}
