'use strict'

const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const log = require('electron-log')
// TODO: require('@imjs/electron-differential-updater')
const {
  MacUpdater
} = require('electron-updater')

const appDir = path.dirname(require.main.filename)

class BfxMacUpdater extends MacUpdater {
  setDownloadedFilePath (downloadedFilePath) {
    this.downloadedFilePath = downloadedFilePath
  }

  getDownloadedFilePath () {
    return this.downloadedFilePath
  }

  quitAndInstall (...args) {
    const downloadedFilePath = this.getDownloadedFilePath()

    if (!fs.existsSync(downloadedFilePath)) {
      return
    }
    if (path.extname(downloadedFilePath) !== '.zip') {
      return super.quitAndInstall(...args)
    }

    const root = path.join(appDir, '../..')
    const dist = path.join(root, '..')
    const exec = path.join(root, 'Contents/MacOS/Bitfinex Report')

    try {
      fs.rmdirSync(root, { recursive: true })
    } catch (err) {
      log.error(err)
    }
    try {
      spawn(exec, [], {
        detached: true,
        stdio: 'ignore',
        env: {
          ...process.env
        },
        cwd: root
      }).unref()
    } catch (err) {
      log.error(err)
    }
  }
}

module.exports = BfxMacUpdater
