'use strict'

const { app, ipcMain, Menu } = require('electron')
const { rootPath: appDir } = require('electron-root-path')
const fs = require('fs')
const path = require('path')
const {
  AppImageUpdater,
  NsisUpdater,
  AppUpdater
} = require('electron-updater')
const Alert = require('electron-alert')
const yaml = require('js-yaml')
const i18next = require('i18next')

const isMac = process.platform === 'darwin'

const log = require('../error-manager/log')
const BfxMacUpdater = require('./bfx.mac.updater')
const wins = require('../window-creators/windows')
const WINDOW_NAMES = require('../window-creators/window.names')
const {
  showLoadingWindow,
  hideLoadingWindow
} = require('../window-creators/change-loading-win-visibility-state')
const {
  closeAlert
} = require('../modal-dialog-src/utils')
const parseEnvValToBool = require('../helpers/parse-env-val-to-bool')
const {
  WINDOW_EVENT_NAMES,
  addOnceProcEventHandler
} = require('../window-creators/window-event-manager')
const getUIFontsAsCSSString = require(
  '../helpers/get-ui-fonts-as-css-string'
)
const ThemeIpcChannelHandlers = require(
  '../window-creators/main-renderer-ipc-bridge/theme-ipc-channel-handlers'
)

const MENU_ITEM_IDS = require('../create-menu/menu.item.ids')

const isAutoUpdateDisabled = parseEnvValToBool(process.env.IS_AUTO_UPDATE_DISABLED)

const fontsStyle = getUIFontsAsCSSString()
const themesStyle = fs.readFileSync(path.join(
  __dirname, '../window-creators/layouts/themes.css'
))
const toastStyle = fs.readFileSync(path.join(
  __dirname, 'toast-src/toast.css'
))
const toastScript = fs.readFileSync(path.join(
  __dirname, 'toast-src/toast.js'
))

let toast
let autoUpdater
let uCheckInterval
let isIntervalUpdate = false
let isProgressToastEnabled = false
let electronBuilderConfig = {}

try {
  electronBuilderConfig = require(path.join(appDir, 'electron-builder-config'))
} catch (err) {}

const fonts = `<style>${fontsStyle}</style>`
const themes = `<style>${themesStyle}</style>`
const style = `<style>${toastStyle}</style>`
const script = `<script type="text/javascript">${toastScript}</script>`
const sound = { freq: 'F2', type: 'triange', duration: 1.5 }

const _sendProgress = (progress) => {
  if (!Number.isFinite(progress)) {
    return
  }

  toast?.browserWindow?.webContents.send(
    'progress',
    progress
  )
}
const _sendUid = (alert) => {
  if (!alert?.uid) {
    return
  }

  alert?.browserWindow?.webContents.send(
    'auto-update-toast:uid',
    alert.uid
  )
}

const _fireToast = (
  opts = {},
  hooks = {}
) => {
  const {
    didOpen = () => {},
    didClose = () => {}
  } = { ...hooks }

  closeAlert(toast)

  const height = 44
  const win = wins.mainWindow

  if (
    !win ||
    typeof win !== 'object' ||
    win.isDestroyed()
  ) {
    return { value: false }
  }

  const alert = new Alert([fonts, themes, style, script])
  toast = alert

  const eventHandlerCtx = addOnceProcEventHandler(
    WINDOW_EVENT_NAMES.CLOSED,
    () => closeAlert(alert)
  )
  const autoUpdateToastWidthHandler = (event, data) => {
    alert.browserWindow?.setBounds({
      width: Math.round(data?.width ?? 0)
    })
  }
  const autoUpdateToastRepositionHandler = () => {
    const macOffset = wins.mainWindow?.isFullScreen()
      ? 0
      : 28
    const heightOffset = isMac ? macOffset : 40
    const { x, y, width } = win.getContentBounds()
    const { width: alWidth } = alert.browserWindow.getContentBounds()

    const boundsOpts = {
      x: (x + width) - alWidth,
      y: y + heightOffset,
      height
    }

    alert.browserWindow.setBounds(boundsOpts)
  }

  const bwOptions = {
    frame: false,
    transparent: true,
    thickFrame: false,
    closable: false,
    hasShadow: false,
    backgroundColor: ThemeIpcChannelHandlers.getWindowTitleBackgroundColor(),
    darkTheme: false,
    height,
    width: opts?.width ?? 1000,
    parent: win,
    modal: false,
    webPreferences: {
      contextIsolation: false
    }
  }
  const swalOptions = {
    toast: true,
    position: 'top-end',
    allowOutsideClick: false,

    icon: 'info',
    title: i18next.t('autoUpdater.title'),
    showConfirmButton: true,
    showCancelButton: false,
    confirmButtonText: i18next.t('common.confirmButtonText'),
    cancelButtonText: i18next.t('common.cancelButtonText'),
    timerProgressBar: false,

    ...opts,

    willOpen: () => {
      if (
        !alert ||
        !alert.browserWindow
      ) return

      alert.browserWindow.hide()
    },
    didOpen: () => {
      didOpen(alert)

      if (
        !alert ||
        !alert.browserWindow
      ) return

      alert.browserWindow.show()
    },
    willClose: () => {
      if (
        !alert ||
        !alert.browserWindow
      ) return

      alert.browserWindow.hide()
    },
    didClose: () => {
      eventHandlerCtx.removeListener()
      ipcMain.removeListener(
        `${alert.uid}auto-update-toast:width`,
        autoUpdateToastWidthHandler
      )
      ipcMain.removeListener(
        `${alert.uid}reposition`,
        autoUpdateToastRepositionHandler
      )

      didClose(alert)
    }
  }

  const res = alert.fire(
    swalOptions,
    bwOptions,
    null,
    true,
    false,
    sound
  )

  _sendUid(alert)
  ipcMain.on(`${alert.uid}auto-update-toast:width`, autoUpdateToastWidthHandler)
  ipcMain.on(`${alert.uid}reposition`, autoUpdateToastRepositionHandler)

  return res
}

const _getUpdateMenuItemById = (id) => {
  const menu = Menu.getApplicationMenu()

  if (
    !menu ||
    !id ||
    typeof id !== 'string'
  ) {
    return
  }

  return menu.getMenuItemById(id)
}

const _switchMenuItem = (opts = {}) => {
  const {
    isCheckMenuItemDisabled,
    isInstallMenuItemVisible
  } = { ...opts }
  const checkMenuItem = _getUpdateMenuItemById(
    MENU_ITEM_IDS.CHECK_UPDATE_MENU_ITEM
  )
  const installMenuItem = _getUpdateMenuItemById(
    MENU_ITEM_IDS.INSTALL_UPDATE_MENU_ITEM
  )

  if (
    !checkMenuItem ||
    !installMenuItem
  ) {
    return
  }

  if (typeof isCheckMenuItemDisabled === 'boolean') {
    checkMenuItem.enabled = !isCheckMenuItemDisabled
  }
  if (typeof isInstallMenuItemVisible === 'boolean') {
    checkMenuItem.visible = !isInstallMenuItemVisible
    installMenuItem.visible = isInstallMenuItemVisible
  }
}

const _reinitInterval = () => {
  clearInterval(uCheckInterval)

  uCheckInterval = setInterval(() => {
    checkForUpdatesAndNotify({ isIntervalUpdate: true })
  }, 60 * 60 * 1000).unref()
}

const _autoUpdaterFactory = () => {
  if (autoUpdater instanceof AppUpdater) {
    return autoUpdater
  }
  if (process.platform === 'win32') {
    autoUpdater = new NsisUpdater()
  }
  if (process.platform === 'darwin') {
    autoUpdater = new BfxMacUpdater()

    autoUpdater.addInstallingUpdateEventHandler(() => {
      return showLoadingWindow({
        windowName: WINDOW_NAMES.LOADING_WINDOW,
        description: i18next.t('autoUpdater.loadingWindow.description'),
        isRequiredToCloseAllWins: true
      })
    })
  }
  if (process.platform === 'linux') {
    autoUpdater = new AppImageUpdater()

    // An option to debug the auto-update flow non-packaged build
    if (
      process.env.IS_AUTO_UPDATE_BEING_TESTED &&
      !process.env.APPIMAGE &&
      !app.isPackaged
    ) {
      process.env.APPIMAGE = path.join(
        __dirname, '../../stub.AppImage'
      )

      fs.closeSync(fs.openSync(process.env.APPIMAGE, 'w'))
      Object.defineProperty(autoUpdater.app, 'isPackaged', {
        get () { return true }
      })
      Object.defineProperty(autoUpdater.app, 'appUpdateConfigPath', {
        get () {
          return path.join(this.app.getAppPath(), 'dev-app-update.yml')
        }
      })
    }
  }

  autoUpdater.on('error', async (err) => {
    try {
      // Skip error when can't get code signature on mac
      if (/Could not get code signature/gi.test(err.toString())) {
        return
      }

      isProgressToastEnabled = false

      await hideLoadingWindow({
        windowName: WINDOW_NAMES.LOADING_WINDOW,
        isRequiredToShowMainWin: false
      })

      _switchMenuItem({
        isCheckMenuItemDisabled: false,
        isInstallMenuItemVisible: false
      })

      if (
        /ERR_INTERNET_DISCONNECTED/gi.test(err.toString())
      ) {
        await _fireToast({
          title: i18next.t('autoUpdater.errorToast.inetIssueTitle'),
          icon: 'error',
          timer: 60000
        })

        return
      }

      await _fireToast({
        title: i18next.t('autoUpdater.errorToast.title'),
        icon: 'error',
        timer: 60000
      })
    } catch (err) {
      console.error(err)
    }
  })
  autoUpdater.on('checking-for-update', async () => {
    try {
      if (isIntervalUpdate) {
        return
      }

      await _fireToast(
        {
          title: i18next.t('autoUpdater.checkingForUpdateToast.title'),
          type: 'warning',
          timer: 10000
        },
        {
          didOpen: (alert) => alert.showLoading()
        }
      )

      _reinitInterval()
    } catch (err) {
      console.error(err)
    }
  })
  autoUpdater.on('update-available', async (info) => {
    try {
      const { version } = { ...info }

      const { value, dismiss } = await _fireToast(
        {
          title: i18next.t(
            'autoUpdater.updateAvailableToast.title',
            { version }
          ),
          text: i18next.t('autoUpdater.updateAvailableToast.description'),
          icon: 'info',
          timer: 10000
        }
      )

      if (
        !value &&
        dismiss !== 'timer'
      ) {
        _switchMenuItem({
          isCheckMenuItemDisabled: false
        })

        return
      }

      await _autoUpdaterFactory()
        .downloadUpdate()
    } catch (err) {
      console.error(err)
    }
  })
  autoUpdater.on('update-not-available', async (info) => {
    try {
      _switchMenuItem({
        isCheckMenuItemDisabled: false
      })

      if (isIntervalUpdate) {
        return
      }

      await _fireToast(
        {
          title: i18next.t('autoUpdater.updateNotAvailableToast.title'),
          icon: 'success',
          timer: 10000
        }
      )
    } catch (err) {
      console.error(err)
    }
  })
  autoUpdater.on('download-progress', async (progressObj) => {
    try {
      const { percent } = progressObj ?? {}

      if (isProgressToastEnabled) {
        _sendProgress(percent)

        return
      }

      isProgressToastEnabled = true

      await _fireToast(
        {
          title: i18next.t('autoUpdater.downloadProgressToast.title'),
          icon: 'info'
        },
        {
          didOpen: (alert) => {
            _sendProgress(percent)
            alert.showLoading()
          },
          didClose: () => {
            isProgressToastEnabled = false
          }
        }
      )
    } catch (err) {
      console.error(err)
    }
  })
  autoUpdater.on('update-downloaded', async (info) => {
    try {
      const {
        version,
        downloadedFile
      } = { ...info }

      if (autoUpdater instanceof BfxMacUpdater) {
        autoUpdater.setDownloadedFilePath(downloadedFile)
      }

      isProgressToastEnabled = false

      const { value } = await _fireToast(
        {
          title: i18next.t(
            'autoUpdater.updateDownloadedToast.title',
            { version }
          ),
          text: i18next.t('autoUpdater.updateDownloadedToast.description'),
          icon: 'question',
          timer: 60000,
          showCancelButton: true
        }
      )

      if (!value) {
        _switchMenuItem({
          isCheckMenuItemDisabled: false,
          isInstallMenuItemVisible: true
        })

        return
      }

      await _autoUpdaterFactory()
        .quitAndInstall(false, true)
    } catch (err) {
      console.error(err)
    }
  })

  autoUpdater.autoDownload = false
  autoUpdater.logger = log

  _reinitInterval()

  return autoUpdater
}

const checkForUpdates = () => {
  return async () => {
    try {
      if (isAutoUpdateDisabled) {
        console.debug('Auto-update is disabled')

        return
      }

      isIntervalUpdate = false
      _switchMenuItem({
        isCheckMenuItemDisabled: true
      })

      const res = await _autoUpdaterFactory()
        .checkForUpdates()

      return res
    } catch (err) {
      console.error(err)
    }
  }
}

const checkForUpdatesAndNotify = async (opts) => {
  try {
    if (isAutoUpdateDisabled) {
      console.debug('Auto-update is disabled')

      return
    }

    const {
      isIntervalUpdate: isIntUp = false
    } = { ...opts }

    isIntervalUpdate = isIntUp
    _switchMenuItem({
      isCheckMenuItemDisabled: true
    })

    const res = await _autoUpdaterFactory()
      .checkForUpdatesAndNotify()

    return res
  } catch (err) {
    console.error(err)
  }
}

const quitAndInstall = () => {
  return () => {
    if (isAutoUpdateDisabled) {
      return
    }

    return _autoUpdaterFactory()
      .quitAndInstall(false, true)
  }
}

const getAppUpdateConfigSync = () => {
  try {
    if (isAutoUpdateDisabled) {
      return electronBuilderConfig
        ?.publish ?? {}
    }

    const appUpdateConfigPath = _autoUpdaterFactory()
      .app.appUpdateConfigPath
    const fileContent = fs.readFileSync(appUpdateConfigPath, 'utf8')

    return yaml.load(fileContent)
  } catch (err) {
    console.debug(err)

    return electronBuilderConfig
      ?.publish ?? {}
  }
}

module.exports = {
  checkForUpdates,
  checkForUpdatesAndNotify,
  quitAndInstall,
  getAppUpdateConfigSync
}
