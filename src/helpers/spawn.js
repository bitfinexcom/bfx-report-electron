'use strict'

const { spawn } = require('child_process')
const os = require('os')

module.exports = (command, args = [], opts) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, opts)

    const res = []
    const err = []

    child.on('error', (err) => {
      reject(err)
    })
    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(err.join(os.EOL)))

        return
      }

      resolve(res.join(os.EOL))
    })
    child.stdout.on('data', (data) => {
      res.push(data)
    })
    child.stderr.on('data', (data) => {
      err.push(data)
    })
  })
}
