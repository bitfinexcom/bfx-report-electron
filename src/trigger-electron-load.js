'use strict'

const path = require('path')
const fs = require('fs')

const wins = require('./window-creators/windows')
const pathToTriggerElectronLoad = path.join(
  __dirname,
  '../bfx-report-ui/build/triggerElectronLoad.js'
)
const triggerElectronLoadStr = fs.readFileSync(
  pathToTriggerElectronLoad,
  'utf8'
)

const placeholderPattern = /\$\{apiPort\}/
let cachedExpressApiPort = null

module.exports = (args) => {
  const { expressApiPort = cachedExpressApiPort } = args ?? {}
  cachedExpressApiPort = expressApiPort
  const scriptStr = triggerElectronLoadStr.replace(
    placeholderPattern,
    expressApiPort
  )

  return wins.mainWindow.webContents
    .executeJavaScript(scriptStr)
}
