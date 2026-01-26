'use strict'

const path = require('node:path')
const fs = require('node:fs')
const { mkdir, rm } = require('node:fs/promises')
const { spawn } = require('node:child_process')
const { MacUpdater } = require('electron-updater')
const extract = require('extract-zip')

const { rootPath } = require('../helpers/root-path')

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

  async install (isSilent, isForceRunAfter) {
    try {
      if (this.quitAndInstallCalled) {
        this._logger.warn('Install call ignored: quitAndInstallCalled is set to true')

        return false
      }

      this.quitAndInstallCalled = true

      this._logger.info(`Install: isSilent: ${isSilent}, isForceRunAfter: ${isForceRunAfter}`)

      if (!isSilent) {
        await this.dispatchInstallingUpdate()
      }

      const downloadedFilePath = this.getDownloadedFilePath()

      const root = this.forceDevUpdateConfig
        ? path.join(rootPath, 'stub.mac-release')
        : path.join(rootPath, '../../..')
      const dist = this.forceDevUpdateConfig
        ? root
        : path.join(root, '..')
      const exec = this.forceDevUpdateConfig
        ? path.join(root, 'Bitfinex Report.app/Contents/MacOS/Bitfinex Report')
        : path.join(root, 'Contents/MacOS/Bitfinex Report')

      await rm(root, { recursive: true, force: true })

      if (this.forceDevUpdateConfig) {
        await mkdir(root, { recursive: true })
      }

      await extract(
        downloadedFilePath,
        {
          dir: dist,
          defaultDirMode: '0o777',
          defaultFileMode: '0o777'
        }
      )

      if (!isForceRunAfter) {
        return true
      }

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

  async asyncQuitAndInstall (isSilent, isForceRunAfter) {
    this._logger.info('Install on explicit quitAndInstall')

    const isInstalled = await this.install(
      isSilent,
      isSilent
        ? isForceRunAfter
        : true
    )

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

    return this.asyncQuitAndInstall(...args)
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
      if (exitCode === 0) {
        return
      }

      this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${exitCode}`)
    })

    // Need to use this.app.app prop due this.app is ElectronAppAdapter
    this.app.app.once('will-quit', (e) => {
      if (this.quitAndInstallCalled) {
        this._logger.info('Update installer has already been triggered. Quitting application.')

        return
      }

      e.preventDefault()
      this._logger.info('Auto install update on quit')

      this.install(true, true).then((isInstalled) => {
        if (isInstalled) {
          setImmediate(() => this.app.quit())

          return
        }

        setImmediate(() => this.app.app.exit(1))
      })
    })
  }
}

module.exports = BfxMacUpdater
