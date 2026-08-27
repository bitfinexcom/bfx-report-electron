'use strict'

const { app } = require('electron')
const i18next = require('i18next')

const { initIpcChannelHandlers } = require(
  './window-creators/main-renderer-ipc-bridge/utils'
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
const WINDOW_NAMES = require('./window-creators/window.names')
const makeOrReadSecretKey = require('./make-or-read-secret-key')
const {
  IpcMessageError,
  AppInitializationError
} = require('./errors')
const {
  deserializeError,
  getFreePort,
  manageConfigs,
  platformIdentifiers: {
    IS_WIN
  },
  migrateDbFilesToSandboxOnMacOS
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
const makeReportFolderAndShowModalIfNoWritePerm = require(
  './make-report-folder-and-show-modal-if-no-write-perm'
)

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

module.exports = async () => {
  try {
    const {
      ThemeIpcChannelHandlers
    } = initIpcChannelHandlers()

    app.disableHardwareAcceleration()
    app.on('window-all-closed', () => {
      app.quit()
    })

    await app.whenReady()
    await enforceMacOSAppLocation()
    migrateDbFilesToSandboxOnMacOS()

    // https://www.electronjs.org/docs/latest/tutorial/notifications#windows
    if (IS_WIN) {
      app.setAppUserModelId(app.name)
    }

    const pathToUserData = getUserDataPath()
    const pathToUserDocuments = app.getPath('documents')
    const pathToUserDownloads = app.getPath('downloads')

    const configsKeeper = manageConfigs({
      pathToUserData,
      pathToUserDocuments,
      pathToUserDownloads
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
      pathToUserDocuments,
      pathToUserDownloads
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
    await hideLoadingWindow({
      windowName: WINDOW_NAMES.STARTUP_LOADING_WINDOW,
      isRequiredToShowMainWin: true
    })
    await triggerElectronLoad(portsMap)
    await checkForUpdatesAndNotify()

    printToPDF()
    // No need to wait for user actions
    makeReportFolderAndShowModalIfNoWritePerm()
      .catch((err) => console.error(err))
  } catch (err) {
    await app.whenReady()
    await createErrorWindow()

    throw err
  }
}
