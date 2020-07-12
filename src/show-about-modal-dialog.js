'use strict'

const {
  dialog,
  remote,
  shell,
  clipboard,
  BrowserWindow
} = require('electron')
const path = require('path')
const os = require('os')

const { EOL } = os

const packageJson = require('../package.json')

let lastCommit = { hash: '-', date: '-' }

try {
  lastCommit = require('../lastCommit.json')
} catch (e) {}

module.exports = () => {
  const _dialog = dialog || remote.dialog

  return () => {
    const win = BrowserWindow.getFocusedWindow()
    const productName = 'Bitfinex Report'

    const type = os.type()
    const arch = os.arch()
    const release = os.release()

    const detail = `
Version: ${packageJson.version}${EOL}\
Commit: ${lastCommit.hash}${EOL}\
Date:  ${lastCommit.date}${EOL}\
Electron: ${process.versions.electron}${EOL}\
Chrome: ${process.versions.chrome}${EOL}\
Node.js: ${process.versions.node}${EOL}\
V8: ${process.versions.v8}${EOL}\
OS: ${type} ${arch} ${release}\
`

    _dialog.showMessageBox(
      win,
      {
        type: 'info',
        title: productName,
        message: productName,
        detail,
        buttons: ['Copy', 'GitHub', 'OK'],
        defaultId: 2,
        cancelId: 2,
        icon: path.join(__dirname, '../build/icons/64x64.png')
      },
      async (btnId) => {
        try {
          if (btnId === 2) {
            return
          }
          if (btnId === 1) {
            shell.openExternal(
              packageJson.repository || 'https://github.com'
            )
          }

          clipboard.writeText(detail)
        } catch (err) {
          console.error(err)
        }
      }
    )
  }
}
