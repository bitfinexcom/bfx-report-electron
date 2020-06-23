'use strict'

const path = require('path')
const fs = require('fs')

const wins = require('./windows')
const pathToTriggerElectronLoad = path.join(
  __dirname,
  '../bfx-report-ui/build/triggerElectronLoad.js'
)
const triggerElectronLoadStr = fs.readFileSync(
  pathToTriggerElectronLoad,
  'utf8'
)

module.exports = () => {
  wins.mainWindow.webContents
    .executeJavaScript(triggerElectronLoadStr)
}
