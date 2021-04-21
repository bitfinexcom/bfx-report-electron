'use strict'

const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const log = require('electron-log')
// TODO: require('@imjs/electron-differential-updater')
const {
  MacUpdater
} = require('electron-updater')
const extract = require('extract-zip')

const appDir = path.dirname(require.main.filename)

class BfxMacUpdater extends MacUpdater {
  setDownloadedFilePath (downloadedFilePath) {
    this.downloadedFilePath = downloadedFilePath
  }

  getDownloadedFilePath () {
    return this.downloadedFilePath
  }

  async asyncInstaller () {
    try {
      const downloadedFilePath = this.getDownloadedFilePath()

      const root = path.join(appDir, '../..')
      const dist = path.join(root, '..')
      const exec = path.join(root, 'Contents/MacOS/Bitfinex Report')

      await fs.promises.rmdir(root, { recursive: true })

      await extract(
        downloadedFilePath,
        {
          dir: dist,
          defaultDirMode: '0o777',
          defaultFileMode: '0o777'
        }
      )

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

  quitAndInstall (...args) {
    const downloadedFilePath = this.getDownloadedFilePath()

    if (!fs.existsSync(downloadedFilePath)) {
      return
    }
    if (path.extname(downloadedFilePath) !== '.zip') {
      return super.quitAndInstall(...args)
    }

    return this.asyncInstaller()
  }
}

module.exports = BfxMacUpdater
