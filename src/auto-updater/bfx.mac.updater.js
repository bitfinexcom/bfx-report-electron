'use strict'

const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const { MacUpdater } = require('electron-updater')
const extract = require('extract-zip')

const appDir = path.dirname(require.main.filename)

class BfxMacUpdater extends MacUpdater {
  constructor (...args) {
    super(...args)

    this.quitAndInstallCalled = false
    this.quitHandlerAdded = false
  }

  setDownloadedFilePath (downloadedFilePath) {
    this.downloadedFilePath = downloadedFilePath
  }

  getDownloadedFilePath () {
    return this.downloadedFilePath
  }

  async install () {
    try {
      if (this.quitAndInstallCalled) {
        this._logger.warn('Install call ignored: quitAndInstallCalled is set to true')

        return false
      }

      this.quitAndInstallCalled = true

      const downloadedFilePath = this.getDownloadedFilePath()

      const root = path.join(appDir, '../../..')
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

      // TODO: double check spawning app
      spawn(exec, [], {
        detached: true,
        stdio: 'ignore',
        env: {
          ...process.env
        }
      }).unref()
    } catch (err) {
      this.dispatchError(err)

      return false
    }
  }

  async asyncInstaller () {
    this._logger.info('Install on explicit quitAndInstall')

    // TODO: need to emit that app is installing to stop app
    //       and show loading spinner as zip extraction may take long time
    const isInstalled = await this.install()

    if (isInstalled) {
      setImmediate(() => this.app.quit())

      return
    }

    this.quitAndInstallCalled = false
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

  addQuitHandler () {
    if (
      this.quitHandlerAdded ||
      !this.autoInstallOnAppQuit
    ) {
      return
    }

    this.quitHandlerAdded = true

    this.app.onQuit((exitCode) => {
      if (this.quitAndInstallCalled) {
        this._logger.info('Update installer has already been triggered. Quitting application.')

        return
      }
      if (exitCode !== 0) {
        this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${exitCode}`)

        return
      }

      this._logger.info('Auto install update on quit')

      this.install().catch((err) => {
        this.dispatchError(err)
      })
    })
  }
}

module.exports = BfxMacUpdater
