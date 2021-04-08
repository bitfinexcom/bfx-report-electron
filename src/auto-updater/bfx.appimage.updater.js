'use strict'

const path = require('path')
const fs = require('fs')
const {
  AppImageUpdater
} = require('electron-updater')
const log = require('electron-log')

const appDir = path.dirname(require.main.filename)
const {
  version
} = require(path.join(appDir, 'package.json'))

process.env.APPIMAGE = path.join(
  path.join(appDir, '../../..'),
  `BitfinexReport-${version}-x64-linux.AppImage`
)

const isZipRelease = (root) => {
  const isZipReleaseFile = path.join(root, 'isZipRelease')

  return fs.existsSync(isZipReleaseFile)
}

const makeTempReleaseFile = (root) => {
  const fileName = `BitfinexReport-${version}-x64-linux.AppImage`
  const filePath = path.join(root, '..', fileName)

  fs.writeFileSync(filePath, '')

  return filePath
}

const prepareInstall = () => {
  const root = path.join(appDir, '../..')

  if (!isZipRelease(root)) {
    return
  }

  try {
    fs.rmdirSync(root, { recursive: true })
  } catch (err) {
    log.error(err)
  }

  process.env.APPIMAGE = makeTempReleaseFile(root)
}

class BfxAppImageUpdater extends AppImageUpdater {
  doInstall (...args) {
    prepareInstall()

    return super.doInstall(...args)
  }
}

module.exports = BfxAppImageUpdater
