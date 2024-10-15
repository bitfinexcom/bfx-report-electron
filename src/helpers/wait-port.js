'use strict'

const net = require('net')

module.exports = (args) => {
  const { host, port } = args ?? {}

  const client = new net.Socket()
  let isStarted = false
  let errCount = 0

  return new Promise((resolve, reject) => {
    const listener = () => {
      client.end()

      if (isStarted) return

      isStarted = true
      resolve()
    }
    const tryConnection = () => {
      client.removeListener('connect', listener)
      client.connect({ host, port }, listener)
    }

    client.on('error', (err) => {
      errCount += 1

      if (errCount >= 60) {
        client.end()
        reject(err)

        return
      }

      setTimeout(tryConnection, 1000)
    })

    tryConnection()
  })
}
