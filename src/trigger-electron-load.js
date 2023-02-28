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

const placeholderPattern = /\$\{apiPort\}/

module.exports = (args) => {
  const { expressApiPort = null } = args ?? {}
  const scriptStr = triggerElectronLoadStr.replace(
    placeholderPattern,
    expressApiPort
  )

  return wins.mainWindow.webContents
    .executeJavaScript(scriptStr)
}
