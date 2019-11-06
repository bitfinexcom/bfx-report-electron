'use strict'

const electron = require('electron')
const path = require('path')
const serve = require('electron-serve')

const { app } = electron
const publicDir = path.join(__dirname, 'bfx-report-ui/build')

const {
  makeSingleInstance,
  initializeApp,
  appStates
} = require('./helpers')

appStates.loadURL = serve({ directory: publicDir })
const shouldQuit = makeSingleInstance()

if (shouldQuit) {
  app.quit()
} else {
  initializeApp()
}
