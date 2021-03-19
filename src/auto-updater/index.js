'use strict'

const electron = require('electron')
const {
  AppImageUpdater,
  MacUpdater,
  NsisUpdater,
  AppUpdater
} = require('electron-updater')
const log = require('electron-log')
const Alert = require('electron-alert')

const wins = require('../windows')

let toast
let autoUpdater
let menuItem

const sound = { freq: 'F2', type: 'triange', duration: 1.5 }

const _fireToast = (
  opts = {},
  hooks = {}
) => {
  const {
    onOpen = () => {},
    onClose = () => {}
  } = { ...hooks }

  if (
    toast &&
    toast.browserWindow
  ) {
    toast.browserWindow.close()
  }

  const win = (
    electron.BrowserWindow.getFocusedWindow() ||
    wins.mainWindow
  )
  const alert = new Alert()
  toast = alert

  const _closeToast = () => {
    if (!alert.browserWindow) return

    alert.browserWindow.close()
  }

  win.once('closed', _closeToast)

  const res = alert.fireFrameless({
    toast: true,
    position: 'top-end',
    icon: 'info',
    title: 'Update',
    showConfirmButton: true,
    showCancelButton: false,
    timerProgressBar: false,
    ...opts,

    onBeforeOpen: () => {
      if (!alert.browserWindow) return

      alert.browserWindow.once('blur', _closeToast)
    },
    onOpen: () => onOpen(alert),
    onClose: () => {
      win.removeListener('closed', _closeToast)
      onClose(alert)
    }
  }, null, true, false, sound)

  return { res, alert }
}

const _switchMenuItem = (isEnabled = false) => {
  if (
    !menuItem ||
    typeof menuItem !== 'object'
  ) {
    return
  }

  menuItem.enabled = isEnabled
}

const _autoUpdaterFactory = () => {
  if (autoUpdater instanceof AppUpdater) {
    return autoUpdater
  }
  if (process.platform === 'win32') {
    autoUpdater = new NsisUpdater()
  }
  if (process.platform === 'darwin') {
    // TODO: don't support auto-update for mac right now
    // autoUpdater = new MacUpdater(_options)
    return autoUpdater
  }
  if (process.platform === 'linux') {
    // TODO: don't support auto-update for linux right now
    // autoUpdater = new AppImageUpdater(_options)
    return autoUpdater
  }

  autoUpdater.on('error', () => {
    _fireToast({
      title: 'Application update failed',
      icon: 'error',
      timer: 60000
    })
  })
  autoUpdater.on('checking-for-update', () => {
    _fireToast(
      {
        title: 'Checking for update',
        icon: 'warning',
        timer: 10000,
        timerProgressBar: true
      },
      {
        onOpen: (alert) => alert.showLoading()
      }
    )
  })
  autoUpdater.on('update-available', async (info) => {
    try {
      const { version } = { ...info }

      const { res } = _fireToast(
        {
          title: `An update to v${version} is available`,
          text: 'Starting download...',
          icon: 'info',
          timer: 10000,
          timerProgressBar: true
        }
      )
      const { isConfirmed, dismiss } = await res

      if (
        !isConfirmed ||
        dismiss !== 'timer'
      ) {
        return
      }

      _autoUpdaterFactory()
        .downloadUpdate()
    } catch (err) {
      console.error(err)
    }
  })
  autoUpdater.on('update-not-available', (info) => {
    _fireToast(
      {
        title: 'No updates available',
        icon: 'success',
        timer: 10000
      }
    )
  })
  // TODO:
  autoUpdater.on('download-progress', (progressObj) => {
    log.info(`Download progress: ${JSON.stringify(progressObj)}`)
  })
  autoUpdater.on('update-downloaded', async (info) => {
    try {
      const { version } = { ...info }

      const { res } = _fireToast(
        {
          title: `Update v${version} downloaded`,
          text: 'Should the app be updated right now?',
          icon: 'question',
          timer: 60000,
          showCancelButton: true
        }
      )
      const { isConfirmed } = await res

      if (!isConfirmed) {
        return
      }

      _autoUpdaterFactory()
        .quitAndInstall(false, true)
    } catch (err) {
      console.error(err)
    }
  })

  autoUpdater.autoDownload = false
  autoUpdater.logger = log
  autoUpdater.logger.transports.file.level = 'info'

  return autoUpdater
}

const checkForUpdates = (opts) => {
  if (!menuItem) {
    menuItem = opts.menuItem
  }

  return () => {
    _switchMenuItem(false)

    return _autoUpdaterFactory()
      .checkForUpdates()
  }
}

const checkForUpdatesAndNotify = () => {
  _switchMenuItem(false)

  return _autoUpdaterFactory()
    .checkForUpdatesAndNotify()
}

// TODO:
const quitAndInstall = () => {
  _autoUpdaterFactory()
    .quitAndInstall(false, true)
}

module.exports = {
  checkForUpdates,
  checkForUpdatesAndNotify,
  quitAndInstall
}
