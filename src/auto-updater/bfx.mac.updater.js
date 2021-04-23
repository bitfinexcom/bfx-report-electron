'use strict'

const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const { MacUpdater } = require('electron-updater')
const extract = require('extract-zip')

const { rootPath: appDir } = require('electron-root-path')

class BfxMacUpdater extends MacUpdater {
  constructor (...args) {
    super(...args)

    this.quitAndInstallCalled = false
    this.quitHandlerAdded = false

    this.EVENT_INSTALLING_UPDATE = 'EVENT_INSTALLING_UPDATE'

    this.installingUpdateEventHandlers = []
  }

  setDownloadedFilePath (downloadedFilePath) {
    this.downloadedFilePath = downloadedFilePath
  }

  getDownloadedFilePath () {
    return this.downloadedFilePath
  }

  addInstallingUpdateEventHandler (handler) {
    this.installingUpdateEventHandlers.push(handler)
  }

  async install () {
    try {
      if (this.quitAndInstallCalled) {
        this._logger.warn('Install call ignored: quitAndInstallCalled is set to true')

        return false
      }

      await this.dispatchInstallingUpdate()
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

      return true
    } catch (err) {
      this.dispatchError(err)

      return false
    }
  }

  async asyncInstaller () {
    this._logger.info('Install on explicit quitAndInstall')

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

  async dispatchInstallingUpdate () {
    this.emit(this.EVENT_INSTALLING_UPDATE)

    for (const handler of this.installingUpdateEventHandlers) {
      if (typeof handler !== 'function') {
        return
      }

      await handler()
    }
  }

  dispatchUpdateDownloaded (...args) {
    super.dispatchUpdateDownloaded(...args)

    this.addQuitHandler()
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
