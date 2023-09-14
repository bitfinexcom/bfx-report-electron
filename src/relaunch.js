'use strict'

const electron = require('electron')

module.exports = () => {
  const options = {
    args: process.argv.slice(1).concat(['--relaunch'])
  }

  if (process.env.APPIMAGE) {
    options.execPath = process.env.APPIMAGE
    options.args.unshift('--appimage-extract-and-run')
  }

  electron.app.relaunch(options)
  electron.app.exit(0)
}
