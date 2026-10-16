'use strict'

const { app } = require('electron')
const fs = require('node:fs')
const path = require('node:path')
const {
  DebUpdater,
  AppImageUpdater,
  NsisUpdater,
  AppUpdater
} = require('electron-updater')
const yaml = require('js-yaml')
const i18next = require('i18next')

const log = require('../error-manager/log')
const BfxMacUpdater = require('./bfx.mac.updater')
const wins = require('../window-creators/windows')
const WINDOW_NAMES = require('../window-creators/window.names')
const {
  showLoadingWindow,
  hideLoadingWindow
} = require('../window-creators/change-loading-win-visibility-state')
const { rootPath } = require('../helpers/root-path')
const parseEnvValToBool = require('../helpers/parse-env-val-to-bool')
const {
  IS_MAC,
  IS_LINUX,
  IS_WIN
} = require('../helpers/platform-identifiers')
const AutoUpdateIpcChannelHandlers = require(
  '../window-creators/main-renderer-ipc-bridge/auto-update-ipc-channel-handlers'
)
const { showUpdateNotification } = require('../show-notification')

const MENU_ITEM_IDS = require('../create-menu/menu.item.ids')
const { changeMenuItemStatesById } = require('../create-menu/utils')

const isAutoUpdateDisabled = parseEnvValToBool(
  process.env.IS_AUTO_UPDATE_DISABLED
)

let autoUpdater
let uCheckInterval
let isIntervalUpdate = false
let isProgressToastEmittingUnlocked = false
let electronBuilderConfig = {}

try {
  electronBuilderConfig = require(path.join(rootPath, 'electron-builder-config'))
} catch (err) {}

const _sendProgress = (progress) => {
  if (!Number.isFinite(progress)) {
    return
  }

  const mainWindow = wins?.[WINDOW_NAMES.MAIN_WINDOW]

  AutoUpdateIpcChannelHandlers.sendProgressToastEvent(mainWindow, {
    progress
  })
}

const _fireToast = async (
  opts = {},
  hooks = {}
) => {
  const mainWindow = wins?.[WINDOW_NAMES.MAIN_WINDOW]

  if (
    !mainWindow ||
    mainWindow?.isDestroyed?.()
  ) {
    return { dismiss: 'close' }
  }

  return await AutoUpdateIpcChannelHandlers.sendFireToastEvent(
    mainWindow,
    {
      icon: 'info',
      title: i18next.t('autoUpdater.title'),
      text: null,
      showConfirmButton: true,
      showCancelButton: false,
      confirmButtonText: i18next.t('common.confirmButtonText'),
      cancelButtonText: i18next.t('common.cancelButtonText'),
      timer: null,
      progress: null,

      ...opts
    }
  )
}

const _switchMenuItem = (opts) => {
  const {
    isCheckMenuItemDisabled,
    isInstallMenuItemVisible
  } = opts ?? {}
  const checkMenuItemOpts = {}
  const installMenuItemOpts = {}

  if (typeof isCheckMenuItemDisabled === 'boolean') {
    checkMenuItemOpts.enabled = !isCheckMenuItemDisabled
  }
  if (typeof isInstallMenuItemVisible === 'boolean') {
    checkMenuItemOpts.visible = !isInstallMenuItemVisible
    installMenuItemOpts.visible = isInstallMenuItemVisible
  }

  changeMenuItemStatesById([
    {
      menuItemId: MENU_ITEM_IDS.CHECK_UPDATE_MENU_ITEM,
      opts: checkMenuItemOpts
    },
    {
      menuItemId: MENU_ITEM_IDS.INSTALL_UPDATE_MENU_ITEM,
      opts: installMenuItemOpts
    }
  ])
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
  if (IS_WIN) {
    autoUpdater = new NsisUpdater()
  }
  if (IS_MAC) {
    autoUpdater = new BfxMacUpdater()

    if (process.env.IS_AUTO_UPDATE_BEING_TESTED) {
      autoUpdater.forceDevUpdateConfig = true
    }

    autoUpdater.addInstallingUpdateEventHandler(() => {
      return showLoadingWindow({
        windowName: WINDOW_NAMES.LOADING_WINDOW,
        description: i18next.t('autoUpdater.loadingWindow.description'),
        isRequiredToCloseAllWins: true
      })
    })
  }
  if (IS_LINUX) {
    autoUpdater = (
      process.env.APPIMAGE ||
      process.env.IS_AUTO_UPDATE_BEING_TESTED
    )
      ? new AppImageUpdater()
      : new DebUpdater()

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
      autoUpdater.forceDevUpdateConfig = true
    }
  }

  autoUpdater.on('error', async (err) => {
    try {
      // Skip error when can't get code signature on mac
      if (/Could not get code signature/gi.test(err.toString())) {
        return
      }

      isProgressToastEmittingUnlocked = false

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
        const title = i18next.t('autoUpdater.errorToast.inetIssueTitle')

        showUpdateNotification({ title, isError: true })
        await _fireToast({
          title,
          icon: 'error',
          timer: 60000
        })

        return
      }

      const title = i18next.t('autoUpdater.errorToast.title')

      showUpdateNotification({ title, isError: true })
      await _fireToast({
        title,
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
          icon: 'loading',
          title: i18next.t('autoUpdater.checkingForUpdateToast.title'),
          timer: 10000
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
      const title = i18next.t(
        'autoUpdater.updateAvailableToast.title',
        { version }
      )

      showUpdateNotification({ title })
      const { dismiss } = await _fireToast(
        {
          title,
          text: i18next.t('autoUpdater.updateAvailableToast.description'),
          timer: 10000
        }
      )

      if (
        dismiss !== 'confirm' &&
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

      if (isProgressToastEmittingUnlocked) {
        _sendProgress(percent)

        return
      }

      isProgressToastEmittingUnlocked = true

      await _fireToast(
        {
          icon: 'loading',
          title: i18next.t('autoUpdater.downloadProgressToast.title'),
          progress: percent
        },
        {
          didOpen: (alert) => {
            _sendProgress(percent)
          }
        }
      )

      isProgressToastEmittingUnlocked = false
    } catch (err) {
      isProgressToastEmittingUnlocked = false

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

      isProgressToastEmittingUnlocked = false
      const title = i18next.t(
        'autoUpdater.updateDownloadedToast.title',
        { version }
      )

      showUpdateNotification({ title })
      const { dismiss } = await _fireToast(
        {
          title,
          text: i18next.t('autoUpdater.updateDownloadedToast.description'),
          icon: 'question',
          timer: 60000,
          showCancelButton: true
        }
      )

      if (dismiss !== 'confirm') {
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
