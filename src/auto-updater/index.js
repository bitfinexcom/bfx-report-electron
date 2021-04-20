'use strict'

const { ipcMain, Menu } = require('electron')
const fs = require('fs')
const path = require('path')
const {
  NsisUpdater,
  AppUpdater
} = require('electron-updater')
const log = require('electron-log')
const Alert = require('electron-alert')

const BfxAppImageUpdater = require('./bfx.appimage.updater')
const BfxMacUpdater = require('./bfx.mac.updater')
const wins = require('../windows')

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

const style = `<style>${toastStyle}</style>`
const script = `<script type="text/javascript">${toastScript}</script>`
const sound = { freq: 'F2', type: 'triange', duration: 1.5 }

const _sendProgress = (progress) => {
  if (
    !toast ||
    !toast.browserWindow ||
    !Number.isFinite(progress)
  ) return

  toast.browserWindow.webContents.send(
    'progress',
    progress
  )
}

const _closeToast = (toast) => {
  if (
    !toast ||
    !toast.browserWindow
  ) return

  toast.browserWindow.hide()
  toast.browserWindow.destroy()
}

const _fireToast = (
  opts = {},
  hooks = {}
) => {
  const {
    onOpen = () => {},
    onAfterClose = () => {}
  } = { ...hooks }

  _closeToast(toast)

  const height = 44
  const win = wins.mainWindow
  const alert = new Alert([style, script])
  toast = alert

  const _closeAlert = () => _closeToast(alert)

  win.once('closed', _closeAlert)

  const bwOptions = {
    frame: false,
    transparent: false,
    thickFrame: false,
    closable: false,
    hasShadow: false,
    backgroundColor: '#172d3e',
    darkTheme: false,
    height,
    parent: win,
    modal: false
  }
  const swalOptions = {
    toast: true,
    position: 'top-end',
    allowOutsideClick: false,
    backdrop: 'rgba(0,0,0,0.0)',

    type: 'info',
    title: 'Update',
    showConfirmButton: true,
    showCancelButton: false,
    timerProgressBar: false,

    ...opts,

    onBeforeOpen: () => {
      if (
        !alert ||
        !alert.browserWindow
      ) return

      alert.browserWindow.hide()
    },
    onOpen: () => {
      onOpen(alert)

      if (
        !alert ||
        !alert.browserWindow
      ) return

      alert.browserWindow.show()
    },
    onClose: () => {
      if (
        !alert ||
        !alert.browserWindow
      ) return

      alert.browserWindow.hide()
    },
    onAfterClose: () => {
      win.removeListener('closed', _closeAlert)

      onAfterClose(alert)
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

  ipcMain.on(alert.uid + 'reposition', () => {
    const { x, y, width } = win.getContentBounds()
    const { width: alWidth } = alert.browserWindow.getContentBounds()

    const boundsOpts = {
      x: (x + width) - alWidth,
      y: y,
      height
    }

    alert.browserWindow.setBounds(boundsOpts)
  })

  return { res, alert }
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
  const checkMenuItem = _getUpdateMenuItemById('CHECK_UPDATE_MENU_ITEM')
  const installMenuItem = _getUpdateMenuItemById('INSTALL_UPDATE_MENU_ITEM')

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
  }
  if (process.platform === 'linux') {
    autoUpdater = new BfxAppImageUpdater()
  }

  autoUpdater.on('error', () => {
    isProgressToastEnabled = false

    _switchMenuItem({
      isCheckMenuItemDisabled: false,
      isInstallMenuItemVisible: false
    })
    _fireToast({
      title: 'Application update failed',
      type: 'error',
      timer: 60000
    })
  })
  autoUpdater.on('checking-for-update', () => {
    if (isIntervalUpdate) {
      return
    }

    _fireToast(
      {
        title: 'Checking for update',
        type: 'warning',
        timer: 10000
      },
      {
        onOpen: (alert) => alert.showLoading()
      }
    )

    _reinitInterval()
  })
  autoUpdater.on('update-available', async (info) => {
    try {
      const { version } = { ...info }

      const { res } = _fireToast(
        {
          title: `An update to v${version} is available`,
          text: 'Starting download...',
          type: 'info',
          timer: 10000
        }
      )
      const { value, dismiss } = await res

      if (
        !value &&
        dismiss !== 'timer'
      ) {
        _switchMenuItem({
          isCheckMenuItemDisabled: false
        })

        return
      }

      _autoUpdaterFactory()
        .downloadUpdate()
    } catch (err) {
      console.error(err)
    }
  })
  autoUpdater.on('update-not-available', (info) => {
    _switchMenuItem({
      isCheckMenuItemDisabled: false
    })

    if (isIntervalUpdate) {
      return
    }

    _fireToast(
      {
        title: 'No updates available',
        type: 'success',
        timer: 10000
      }
    )
  })
  autoUpdater.on('download-progress', (progressObj) => {
    const { percent } = { ...progressObj }

    if (isProgressToastEnabled) {
      _sendProgress(percent)

      return
    }

    _fireToast(
      {
        title: 'Downloading...',
        type: 'info'
      },
      {
        onOpen: (alert) => {
          _sendProgress(percent)
          alert.showLoading()

          isProgressToastEnabled = true
        },
        onAfterClose: () => {
          isProgressToastEnabled = false
        }
      }
    )
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

      const { res } = _fireToast(
        {
          title: `Update v${version} downloaded`,
          text: 'Should the app be updated right now?',
          type: 'question',
          timer: 60000,
          showCancelButton: true
        }
      )
      const { value } = await res

      if (!value) {
        _switchMenuItem({
          isCheckMenuItemDisabled: false,
          isInstallMenuItemVisible: true
        })

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
  autoUpdater.logger.transports.console.level = 'warn'
  autoUpdater.logger.transports.file.level = 'info'

  _reinitInterval()

  return autoUpdater
}

const checkForUpdates = () => {
  return () => {
    isIntervalUpdate = false
    _switchMenuItem({
      isCheckMenuItemDisabled: true
    })

    return _autoUpdaterFactory()
      .checkForUpdates()
  }
}

const checkForUpdatesAndNotify = (opts) => {
  const {
    isIntervalUpdate: isIntUp = false
  } = { ...opts }

  isIntervalUpdate = isIntUp
  _switchMenuItem({
    isCheckMenuItemDisabled: true
  })

  return _autoUpdaterFactory()
    .checkForUpdatesAndNotify()
}

const quitAndInstall = () => {
  return () => {
    return _autoUpdaterFactory()
      .quitAndInstall(false, true)
  }
}

module.exports = {
  checkForUpdates,
  checkForUpdatesAndNotify,
  quitAndInstall
}
