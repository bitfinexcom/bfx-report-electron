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
  IpcMessageError,
  AppInitializationError
} = require('./errors')
const {
  deserializeError,
  getFreePort
} = require('./helpers')
const {
  checkForUpdatesAndNotify
} = require('./auto-updater')
const {
  manageChangelog
} = require('./changelog-manager')
const enforceMacOSAppLocation = require(
  './enforce-macos-app-location'
)
const manageWorkerMessages = require(
  './manage-worker-messages'
)

const pathToLayouts = path.join(__dirname, 'layouts')
const pathToLayoutAppInitErr = path
  .join(pathToLayouts, 'app-init-error.html')

const { rule: schedulerRule } = require(
  '../bfx-reports-framework/config/schedule.json'
)

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
      const timeout = setTimeout(() => {
        rmHandler()
        reject(new AppInitializationError())
      }, 10 * 60 * 1000).unref()

      const rmHandler = () => {
        ipc.off('message', handler)
        clearTimeout(timeout)
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

const _manageConfigs = (params = {}) => {
  const {
    pathToUserData,
    pathToUserDocuments
  } = params

  const pathToUserCsv = path.join(
    pathToUserDocuments,
    'bitfinex/reports'
  )

  const configsKeeper = configsKeeperFactory(
    { pathToUserData },
    {
      pathToUserCsv,
      schedulerRule,
      shownChangelogVer: '0.0.0'
    }
  )
  _resetCsvPath(
    configsKeeper,
    {
      pathToUserCsv,
      isRelativeCsvPath: true
    }
  )
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

    _manageConfigs({
      pathToUserData,
      pathToUserDocuments
    })

    const secretKey = await makeOrReadSecretKey(
      { pathToUserData }
    )

    await createMainWindow({
      pathToUserData,
      pathToUserDocuments
    })
    const portsMap = await getFreePort()
    const ipc = runServer({
      pathToUserData,
      secretKey,
      portsMap
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
    await triggerElectronLoad(portsMap)
    await checkForUpdatesAndNotify()
    await manageChangelog()
  } catch (err) {
    await createErrorWindow(pathToLayoutAppInitErr)

    throw err
  }
}
