'use strict'

const { app } = require('electron')
const path = require('path')

const triggerElectronLoad = require('./trigger-electron-load')
const wins = require('./windows')
const ipcs = require('./ipcs')
const runServer = require('./run-server')
const appStates = require('./app-states')
const {
  createMainWindow,
  createErrorWindow
} = require('./window-creators')
const {
  hideLoadingWindow
} = require('./change-loading-win-visibility-state')
const showMigrationsModalDialog = require(
  './show-migrations-modal-dialog'
)
const makeOrReadSecretKey = require('./make-or-read-secret-key')
const {
  configsKeeperFactory
} = require('./configs-keeper')
const {
  RunningExpressOnPortError,
  IpcMessageError,
  AppInitializationError
} = require('./errors')
const {
  deserializeError
} = require('./helpers')
const {
  checkForUpdatesAndNotify
} = require('./auto-updater')
const {
  isZipRelease
} = require('./auto-updater/utils')
const enforceMacOSAppLocation = require(
  './enforce-macos-app-location'
)

const pathToLayouts = path.join(__dirname, 'layouts')
const pathToLayoutAppInitErr = path
  .join(pathToLayouts, 'app-init-error.html')
const pathToLayoutExprPortReq = path
  .join(pathToLayouts, 'express-port-required.html')

const { rule: schedulerRule } = require(
  '../bfx-reports-framework/config/schedule.json'
)

const _ipcMessToPromise = (ipc) => {
  return new Promise((resolve, reject) => {
    try {
      ipc.once('message', (mess) => {
        if (
          mess ||
          typeof mess === 'object' ||
          typeof mess.err === 'string'
        ) {
          mess.err = deserializeError(mess.err)
        }

        resolve(mess)
      })
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = async () => {
  let isExpressPortError = false

  try {
    app.on('window-all-closed', () => {
      app.quit()
    })

    await app.whenReady()
    await enforceMacOSAppLocation()

    const pathToUserData = app.getPath('userData')
    const pathToUserDocuments = app.getPath('documents')
    const isAppImage = (
      process.platform === 'linux' &&
      !isZipRelease()
    )

    const pathToUserCsv = (
      process.platform === 'darwin' ||
      isAppImage
    )
      ? pathToUserDocuments
      : '../../..'

    const configsKeeper = configsKeeperFactory(
      { pathToUserData },
      {
        pathToUserCsv,
        schedulerRule
      }
    )

    // Need to force setting pathToUserCsv for AppImage
    // to not use internal virtual file system
    if (isAppImage) {
      const storedPathToUserCsv = configsKeeper
        .getConfigByName('pathToUserCsv')

      if (!path.isAbsolute(storedPathToUserCsv)) {
        await configsKeeper.saveConfigs({ pathToUserCsv })
      }
    }

    const secretKey = await makeOrReadSecretKey(
      { pathToUserData }
    )

    await createMainWindow({
      pathToUserData,
      pathToUserDocuments
    })
    runServer({
      pathToUserData,
      secretKey
    })

    const mess = await _ipcMessToPromise(ipcs.serverIpc)
    const {
      state,
      isMigrationsError,
      isMigrationsReady,
      err
    } = { ...mess }

    if (typeof state !== 'string') {
      throw new IpcMessageError()
    }
    if (state === 'error:express-port-required') {
      isExpressPortError = true

      throw err || new RunningExpressOnPortError()
    }
    if (state === 'error:app-init') {
      throw err || new AppInitializationError()
    }
    if (state !== 'ready:server') {
      throw new AppInitializationError()
    }
    if (appStates.isMainWinMaximized) {
      wins.mainWindow.maximize()
    }

    await hideLoadingWindow({ isRequiredToShowMainWin: true })

    triggerElectronLoad()

    await showMigrationsModalDialog(
      isMigrationsError,
      isMigrationsReady
    )

    await checkForUpdatesAndNotify()
  } catch (err) {
    if (isExpressPortError) {
      await createErrorWindow(pathToLayoutExprPortReq)

      throw err
    }

    await createErrorWindow(pathToLayoutAppInitErr)

    throw err
  }
}
