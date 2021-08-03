'use strict'

const electron = require('electron')

module.exports = () => {
  const app = electron.app || electron.remote.app

  const options = {
    args: process.argv.slice(1).concat(['--relaunch'])
  }

  if (process.env.APPIMAGE) {
    options.execPath = process.env.APPIMAGE
    options.args.unshift('--appimage-extract-and-run')
  }

  app.relaunch(options)
  app.exit(0)
}
