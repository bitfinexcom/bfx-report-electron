'use strict'

const {
  AppImageUpdater
} = require('electron-updater')

const {
  prepareInstall,
  setAppImagePathIfZipRelease
} = require('./utils')

setAppImagePathIfZipRelease()

class BfxAppImageUpdater extends AppImageUpdater {
  doInstall (...args) {
    prepareInstall()

    return super.doInstall(...args)
  }
}

module.exports = BfxAppImageUpdater
