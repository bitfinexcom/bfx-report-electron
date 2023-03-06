'use strict'

const { assert } = require('chai')
const { Server } = require('net')
const DHT = require('bittorrent-dht')

const {
  getFreePort,
  isDHTPort,
  getMaxPort,
  getDefaultPorts,
  getPortRangesForLookingUp
} = require('../ports')
const { getServerPromise } = require('../utils')

const checkAssertions = (res) => {
  assert.isObject(res)
  assert.containsAllKeys(res, [
    'grape1DhtPort',
    'grape1ApiPort',
    'grape2DhtPort',
    'grape2ApiPort',
    'workerApiPort',
    'workerWsPort',
    'expressApiPort'
  ])

  const maxPort = getMaxPort()
  const defaultPorts = getDefaultPorts()
  const ranges = getPortRangesForLookingUp()

  for (const [name, port] of Object.entries(res)) {
    assert.isAtLeast(port, defaultPorts[name])
    assert.isAtMost(port, maxPort)

    const errors = []

    for (const { from, to } of ranges) {
      try {
        assert.isAtLeast(port, from)
        assert.isAtMost(port, to)
      } catch (err) {
        errors.push(err)
      }
    }

    if (errors.length >= ranges.length) {
      throw errors[0]
    }
  }
}

describe('getFreePort helper', () => {
  it('it should lookup free ports', async function () {
    const res = await getFreePort()

    checkAssertions(res)
  })

  it('it should lookup free ports while the previous 3 lookups have been used', async function () {
    const dhts = []
    const srvs = []

    for (let i = 0; i < 3; i += 1) {
      const newPorts = await getFreePort()

      for (const [newName, newPort] of Object.entries(newPorts)) {
        if (isDHTPort(newName)) {
          const dht = new DHT()
          dhts.push(dht)

          await getServerPromise(dht, newPort)

          continue
        }

        const srv = new Server()
        srv.unref()
        srvs.push(srv)

        await getServerPromise(srv, newPort)
      }
    }

    const res = await getFreePort()

    checkAssertions(res)

    const promises = []

    for (const dht of dhts) {
      promises.push(new Promise((resolve) => dht.destroy(resolve)))
    }
    for (const srv of srvs) {
      promises.push(new Promise((resolve) => srv.close(resolve)))
    }

    await Promise.all(promises)
  })
})
