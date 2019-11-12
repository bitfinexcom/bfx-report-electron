'use strict'

const electron = require('electron')

module.exports = () => {
  const app = electron.app || electron.remote.app

  app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
  app.exit(0)
}
