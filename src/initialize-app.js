'use strict'

const { app } = require('electron')
const path = require('path')

const { CSV_PATH_VERSION } = require('./const')

const triggerElectronLoad = require('./trigger-electron-load')
const wins = require('./windows')
const runServer = require('./run-server')
const appStates = require('./app-states')
const {
  createMainWindow,
  createErrorWindow
} = require('./window-creators')
const {
  hideLoadingWindow
} = require('./change-loading-win-visibility-state')
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
const manageWorkerMessages = require(
  './manage-worker-messages'
)

const pathToLayouts = path.join(__dirname, 'layouts')
const pathToLayoutAppInitErr = path
  .join(pathToLayouts, 'app-init-error.html')
const pathToLayoutExprPortReq = path
  .join(pathToLayouts, 'express-port-required.html')

const { rule: schedulerRule } = require(
  '../bfx-reports-framework/config/schedule.json'
)

let isExpressPortError = false

const _resetCsvPath = async (
  configsKeeper,
  opts = {}
) => {
  const {
    pathToUserCsv,
    isRelativeCsvPath
  } = opts

  // Need to use a new csv folder path for export
  const storedPathToUserCsv = configsKeeper
    .getConfigByName('pathToUserCsv')
  const csvPathVersion = configsKeeper
    .getConfigByName('csvPathVersion')

  if (csvPathVersion === CSV_PATH_VERSION) {
    return
  }
  if (
    (
      isRelativeCsvPath &&
      !storedPathToUserCsv.endsWith('csv')
    ) ||
    (
      !isRelativeCsvPath &&
      !storedPathToUserCsv.endsWith('bitfinex/reports')
    ) ||
    (
      !isRelativeCsvPath &&
      !path.isAbsolute(storedPathToUserCsv)
    ) ||
    (
      isRelativeCsvPath &&
      path.isAbsolute(storedPathToUserCsv)
    )
  ) {
    await configsKeeper.saveConfigs({
      csvPathVersion: CSV_PATH_VERSION,
      pathToUserCsv
    })

    return
  }

  await configsKeeper.saveConfigs({
    csvPathVersion: CSV_PATH_VERSION
  })
}

const _ipcMessToPromise = (ipc) => {
  return new Promise((resolve, reject) => {
    try {
      const interval = setInterval(() => {
        rmHandler()
        reject(new AppInitializationError())
      }, 10 * 60 * 1000).unref()

      const rmHandler = () => {
        ipc.off('message', handler)
        clearInterval(interval)
      }
      const handler = (mess) => {
        if (
          mess ||
          typeof mess === 'object' ||
          typeof mess.err === 'string'
        ) {
          mess.err = deserializeError(mess.err)
        }

        const { state, err } = mess ?? {}

        if (typeof state !== 'string') {
          rmHandler()
          reject(new IpcMessageError())

          return
        }
        if (state === 'error:express-port-required') {
          isExpressPortError = true

          rmHandler()
          reject(err || new RunningExpressOnPortError())

          return
        }
        if (state === 'error:app-init') {
          rmHandler()
          reject(err || new AppInitializationError())

          return
        }
        if (state === 'ready:server') {
          rmHandler()
          resolve(mess)
        }
      }

      ipc.on('message', handler)
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = async () => {
  try {
    app.on('window-all-closed', () => {
      app.quit()
    })

    await app.whenReady()
    await enforceMacOSAppLocation()

    const pathToUserData = app.getPath('userData')
    const pathToUserDocuments = app.getPath('documents')

    const isZipReleaseRun = isZipRelease()
    const isRelativeCsvPath = (
      isZipReleaseRun &&
      process.platform !== 'darwin'
    )

    const pathToUserCsv = isRelativeCsvPath
      ? path.join('../../..', 'csv')
      : path.join(pathToUserDocuments, 'bitfinex/reports')

    const configsKeeper = configsKeeperFactory(
      { pathToUserData },
      {
        pathToUserCsv,
        schedulerRule
      }
    )
    _resetCsvPath(
      configsKeeper,
      {
        pathToUserCsv,
        isRelativeCsvPath
      }
    )

    const secretKey = await makeOrReadSecretKey(
      { pathToUserData }
    )

    await createMainWindow({
      pathToUserData,
      pathToUserDocuments
    })
    const ipc = runServer({
      pathToUserData,
      secretKey
    })
    const isServerReadyPromise = _ipcMessToPromise(ipc)
    manageWorkerMessages(ipc)
    await isServerReadyPromise

    // Legacy fix related to reprodducing the same behavior on all OS,
    // waiting for checks that it was resolved in the last electron ver
    if (appStates.isMainWinMaximized) {
      wins.mainWindow.maximize()
    }

    await hideLoadingWindow({ isRequiredToShowMainWin: true })
    await triggerElectronLoad()
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
