'use strict'

const DHT = require('bittorrent-dht')

const {
  FreePortError
} = require('../errors')
const { getServerPromise } = require('./utils')

let getPortModule = null

const maxPort = 65535
const defaultPorts = {
  grape1DhtPort: 20002,
  grape1ApiPort: 40001,
  grape2DhtPort: 20001,
  grape2ApiPort: 30001,
  workerApiPort: 3501,
  workerWsPort: 10001,
  expressApiPort: 34343
}
const portRangesForLookingUp = [
  { from: 3500, to: 5000 },
  { from: 6000, to: 24000 },
  { from: 25000, to: 49990 }
]

const getFreePort = async () => {
  const { getPort, portNumbers } = await importGetPortModule()

  const res = { ...defaultPorts }
  const foundPorts = new Set()
  const excludedPorts = new Set()

  for (const [name, port] of Object.entries(res)) {
    const portsForLookingUp = portRangesForLookingUp
      .reduce((accum, curr) => {
        const { from, to } = curr

        if (
          port >= from &&
          port <= to
        ) {
          const range = [...portNumbers(from, to)]
            .filter((item) => item >= port)

          accum.push(...range)
        }

        return accum
      }, [])
    const freePort = await getPort({
      port: [port, ...portsForLookingUp],
      exclude: [...foundPorts, ...excludedPorts]
    })

    if (!isDHTPort(name)) {
      foundPorts.add(freePort)
      res[name] = freePort

      continue
    }

    let newFreePort = freePort
    let count = 0

    while (true) {
      count += 1

      if (
        newFreePort > maxPort ||
        count > maxPort
      ) {
        throw new FreePortError()
      }

      const dht = new DHT()

      try {
        await getServerPromise(dht, newFreePort)

        dht.destroy()

        break
      } catch (err) {}

      dht.destroy()
      excludedPorts.add(newFreePort)

      newFreePort = await getPort({
        port: [port, ...portsForLookingUp],
        exclude: [...foundPorts, ...excludedPorts]
      })
    }

    foundPorts.add(newFreePort)
    res[name] = newFreePort
  }

  return res
}

const importGetPortModule = async () => {
  getPortModule = getPortModule ?? (await import('get-port'))
  const { default: getPort, portNumbers } = getPortModule

  return { getPort, portNumbers }
}

const isDHTPort = (name) => {
  return /dht/i.test(name)
}

module.exports = {
  getFreePort,

  isDHTPort,
  getMaxPort: () => maxPort,
  getDefaultPorts: () => ({ ...defaultPorts }),
  getPortRangesForLookingUp: () => portRangesForLookingUp
    .map((item) => ({ ...item }))
}
