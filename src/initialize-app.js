'use strict'

const { app } = require('electron')
const path = require('path')
const i18next = require('i18next')

const { REPORT_FILES_PATH_VERSION } = require('./const')

const TranslationIpcChannelHandlers = require(
  './window-creators/main-renderer-ipc-bridge/translation-ipc-channel-handlers'
)
const GeneralIpcChannelHandlers = require(
  './window-creators/main-renderer-ipc-bridge/general-ipc-channel-handlers'
)
const MenuIpcChannelHandlers = require(
  './window-creators/main-renderer-ipc-bridge/menu-ipc-channel-handlers'
)
const ThemeIpcChannelHandlers = require(
  './window-creators/main-renderer-ipc-bridge/theme-ipc-channel-handlers'
)
const triggerSyncAfterUpdates = require('./trigger-sync-after-updates')
const triggerElectronLoad = require('./trigger-electron-load')
const runServer = require('./run-server')
const {
  createMainWindow,
  createErrorWindow
} = require('./window-creators')
const {
  hideLoadingWindow
} = require('./window-creators/change-loading-win-visibility-state')
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
  getFreePort,
  initIpcChannelHandlers
} = require('./helpers')
const getUserDataPath = require('./helpers/get-user-data-path')
const {
  checkForUpdatesAndNotify
} = require('./auto-updater')
const enforceMacOSAppLocation = require(
  './enforce-macos-app-location'
)
const manageWorkerMessages = require(
  './manage-worker-messages'
)
const printToPDF = require('./print-to-pdf')

const pathToLayouts = path.join(__dirname, 'window-creators/layouts')
const pathToLayoutAppInitErr = path
  .join(pathToLayouts, 'app-init-error.html')

const { rule: schedulerRule } = require(
  '../bfx-reports-framework/config/schedule.json'
)

const _resetReportFilesPath = async (
  configsKeeper,
  opts = {}
) => {
  const {
    pathToUserReportFiles
  } = opts

  // Need to use a new report folder path for export
  const reportFilesPathVersion = configsKeeper
    .getConfigByName('reportFilesPathVersion') ??
    configsKeeper.getConfigByName('csvPathVersion') // For back compatibility

  if (reportFilesPathVersion === REPORT_FILES_PATH_VERSION) {
    return
  }

  await configsKeeper.saveConfigs({
    reportFilesPathVersion: REPORT_FILES_PATH_VERSION,
    pathToUserReportFiles
  })
}

const _ipcMessToPromise = (ipc) => {
  return new Promise((resolve, reject) => {
    try {
      const timeout = setTimeout(() => {
        rmHandler()
        reject(new AppInitializationError())
      }, 30 * 60 * 1000).unref()

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

  const pathToUserReportFiles = path.join(
    pathToUserDocuments,
    'bitfinex/reports'
  )

  const configsKeeper = configsKeeperFactory(
    { pathToUserData },
    {
      theme: ThemeIpcChannelHandlers.THEME_SOURCES.SYSTEM,
      language: null,
      pathToUserReportFiles,
      schedulerRule,
      triggeredSyncAfterUpdatesVer: '0.0.0'
    }
  )
  _resetReportFilesPath(
    configsKeeper,
    { pathToUserReportFiles }
  )

  return configsKeeper
}

module.exports = async () => {
  try {
    initIpcChannelHandlers(
      GeneralIpcChannelHandlers,
      TranslationIpcChannelHandlers,
      MenuIpcChannelHandlers,
      ThemeIpcChannelHandlers
    )

    app.disableHardwareAcceleration()
    app.on('window-all-closed', () => {
      app.quit()
    })

    await app.whenReady()
    await enforceMacOSAppLocation()

    // https://www.electronjs.org/docs/latest/tutorial/notifications#windows
    if (process.platform === 'win32') {
      app.setAppUserModelId(app.name)
    }

    const pathToUserData = getUserDataPath()
    const pathToUserDocuments = app.getPath('documents')

    const configsKeeper = _manageConfigs({
      pathToUserData,
      pathToUserDocuments
    })
    const savedTheme = configsKeeper.getConfigByName('theme')
    const savedLanguage = configsKeeper.getConfigByName('language')

    if (savedTheme !== ThemeIpcChannelHandlers.THEME_SOURCES.SYSTEM) {
      ThemeIpcChannelHandlers.applyTheme(savedTheme)
    }
    if (savedLanguage) {
      await i18next.changeLanguage(savedLanguage)
    }

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
    await triggerSyncAfterUpdates()
    await hideLoadingWindow({ isRequiredToShowMainWin: true })
    await triggerElectronLoad(portsMap)
    await checkForUpdatesAndNotify()

    printToPDF()
  } catch (err) {
    await app.whenReady()
    await createErrorWindow(pathToLayoutAppInitErr)

    throw err
  }
}
