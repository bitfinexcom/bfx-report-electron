'use strict'

const electron = require('electron')
const path = require('path')
const os = require('os')

const { EOL } = os

const packageJson = require('../package.json')

let lastCommit = { hash: '-', date: '-' }

try {
  lastCommit = require('../lastCommit.json')
} catch (e) {}

module.exports = () => {
  const dialog = electron.dialog || electron.remote.dialog

  return () => {
    const win = electron.BrowserWindow.getFocusedWindow()
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

    dialog.showMessageBox(
      win,
      {
        type: 'info',
        title: productName,
        message: productName,
        detail,
        buttons: ['Copy', 'OK'],
        defaultId: 1,
        cancelId: 1,
        icon: path.join(__dirname, '../build/icons/64x64.png')
      },
      async (btnId) => {
        try {
          if (btnId === 1) {
            return
          }

          electron.clipboard.writeText(detail)
        } catch (err) {
          console.error(err)
        }
      }
    )
  }
}
