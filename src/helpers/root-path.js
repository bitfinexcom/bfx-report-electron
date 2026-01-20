'use strict'

const { app } = require('electron')
const path = require('node:path')

/*
 * Examples (for no asar it will be without `.asar` at the end):
 *   - Dev: /home/user/bfx-report-electron
 *   - macOS DMG and ZIP (asar): /Applications/Bitfinex Report.app/Contents/Resources/app.asar
 *   - Windows NSIS (asar): C:\Users\user\AppData\Local\Programs\bfx-report-electron\resources\app.asar
 *   - Ubuntu DEB (asar): /opt/Bitfinex Report/resources/app.asar
 *   - Ubuntu AppImage (asar): /tmp/.mount_Bitfinex Report/resources/app.asar
 */
const rootPath = app?.getAppPath() ??
  // for non electron env
  path.join(__dirname, '../..')
const isAsar = rootPath.endsWith('.asar')
const unpackedPath = isAsar
  ? rootPath.replace('.asar', '.asar.unpacked')
  : rootPath

module.exports = {
  rootPath,
  isAsar,
  unpackedPath
}
