'use strict'

const path = require('path')
const fs = require('fs')
const log = require('electron-log')

const appDir = path.dirname(require.main.filename)
const _root = path.join(appDir, '../..')
const {
  version
} = require(path.join(appDir, 'package.json'))

const isZipRelease = (root = _root) => {
  const isZipReleaseFile = path.join(root, 'isZipRelease')

  return fs.existsSync(isZipReleaseFile)
}

const getTempReleaseFilePath = (root = _root) => {
  const fileName = `BitfinexReport-${version}-x64-linux.AppImage`
  const filePath = path.join(root, '..', fileName)

  return filePath
}

const setAppImagePath = (
  appImagePath = getTempReleaseFilePath()
) => {
  process.env.APPIMAGE = appImagePath
}

const setAppImagePathIfZipRelease = () => {
  if (!isZipRelease()) return

  setAppImagePath()
}

const makeTempReleaseFile = (filePath) => {
  try {
    fs.writeFileSync(filePath, '')
  } catch (err) {
    log.error(err)
  }
}

const rmOldReleaseDir = (root) => {
  if (!root) {
    return
  }

  try {
    fs.rmdirSync(root, { recursive: true })
  } catch (err) {
    log.error(err)
  }
}

const prepareInstall = () => {
  const root = path.join(appDir, '../..')

  if (!isZipRelease(root)) {
    return
  }

  const filePath = getTempReleaseFilePath(root)
  makeTempReleaseFile(filePath)
  setAppImagePath(filePath)

  return root
}

module.exports = {
  isZipRelease,
  prepareInstall,
  rmOldReleaseDir,
  setAppImagePathIfZipRelease
}
