'use strict'

const path = require('node:path')
const fs = require('node:fs')

const wins = require('./window-creators/windows')
const GeneralIpcChannelHandlers = require(
  './window-creators/main-renderer-ipc-bridge/general-ipc-channel-handlers'
)
const isMainWinAvailable = require('./helpers/is-main-win-available')

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

const reloadWindow = (win, opts) => {
  const {
    reload,
    forceReload
  } = opts ?? {}

  if (
    !reload &&
    !forceReload
  ) {
    return
  }

  return new Promise((resolve, reject) => {
    const handleSuccess = () => {
      win.webContents
        .removeListener('did-fail-load', handleFailure)

      resolve()
    }

    const handleFailure = (e, errCode, errDescr) => {
      win.webContents
        .removeListener('did-finish-load', handleSuccess)

      reject(new Error(`Reload failed with code ${errCode}: ${errDescr}`))
    }

    win.webContents.once('did-finish-load', handleSuccess)
    win.webContents.once('did-fail-load', handleFailure)

    if (forceReload) {
      win.webContents.reloadIgnoringCache()

      return
    }

    win.reload()
  })
}

module.exports = async (args) => {
  const win = args?.win ?? wins.mainWindow

  if (!isMainWinAvailable(win)) {
    return
  }

  const expressApiPort = args?.expressApiPort ?? cachedExpressApiPort

  cachedExpressApiPort = expressApiPort
  const scriptStr = triggerElectronLoadStr.replace(
    placeholderPattern,
    expressApiPort
  )

  await reloadWindow(win, args)

  await GeneralIpcChannelHandlers.sendTriggerElectronLoad(
    win,
    { expressApiPort }
  )
  await win.webContents.executeJavaScript(scriptStr)
}
