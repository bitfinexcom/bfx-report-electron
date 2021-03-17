'use strict'

const {
  AppImageUpdater,
  MacUpdater,
  NsisUpdater,
  AppUpdater
} = require('electron-updater')
const log = require('electron-log')

const showMessageModalDialog = require(
  '../show-message-modal-dialog'
)

let autoUpdater
let menuItem

const _showUpdateStatus = ({ err, info }) => {
  log.info(err || info)
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

  autoUpdater.on('error', (err) => {
    _showUpdateStatus({ err })
  })
  autoUpdater.on('checking-for-update', () => {
    _showUpdateStatus({ info: 'Checking for update...' })
  })
  autoUpdater.on('update-available', (info) => {
    _showUpdateStatus({
      info: `Update available: ${JSON.stringify(info)}`
    })
  })
  autoUpdater.on('update-not-available', (info) => {
    _showUpdateStatus({
      info: `Update not available: ${JSON.stringify(info)}`
    })
  })
  autoUpdater.on('download-progress', (progressObj) => {
    _showUpdateStatus({
      info: `Download progress: ${JSON.stringify(progressObj)}`
    })
  })
  autoUpdater.on('update-downloaded', (info) => {
    _showUpdateStatus({
      info: `Update downloaded: ${JSON.stringify(info)}`
    })
  })

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
    _autoUpdaterFactory().checkForUpdates()
  }
}

const checkForUpdatesAndNotify = () => {
  _switchMenuItem(false)
  _autoUpdaterFactory().checkForUpdatesAndNotify()
}

const quitAndInstall = () => {
  _autoUpdaterFactory().quitAndInstall()
}

module.exports = {
  checkForUpdates,
  checkForUpdatesAndNotify,
  quitAndInstall
}
