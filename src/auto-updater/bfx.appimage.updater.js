'use strict'

const path = require('path')
const { spawn } = require('child_process')
const {
  AppImageUpdater
} = require('electron-updater')

const {
  prepareInstall,
  rmOldReleaseDir,
  setAppImagePathIfZipRelease
} = require('./utils')

setAppImagePathIfZipRelease()

class BfxAppImageUpdater extends AppImageUpdater {
  doInstall (opts) {
    const root = prepareInstall()
    const res = super.doInstall({
      ...opts,
      isForceRunAfter: !root
    })

    if (!root) {
      return res
    }

    const cwd = path.join(root, '..')
    const destination = path.join(
      cwd,
      path.basename(opts.installerPath)
    )

    rmOldReleaseDir(root)
    spawn(destination, [], {
      detached: true,
      stdio: 'ignore',
      env: {
        ...process.env,
        // string is required with AppImage
        APPIMAGE_SILENT_INSTALL: 'true'
      },
      cwd
    }).unref()

    return res
  }
}

module.exports = BfxAppImageUpdater
