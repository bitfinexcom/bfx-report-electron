'use strict'

const wins = require('./windows')
const ipcs = require('./ipcs')
const {
  showLoadingWindow
} = require('./change-loading-win-visibility-state')

module.exports = async () => {
  await showLoadingWindow()

  const winsArr = Object.entries(wins)
  const promises = winsArr.map(([winName, win]) => {
    return new Promise((resolve, reject) => {
      try {
        if (
          winName === 'loadingWindow' ||
          !win ||
          typeof win !== 'object' ||
          win.isDestroyed() ||
          !win.isVisible()
        ) {
          resolve()

          return
        }

        win.once('hide', () => {
          resolve()
        })

        win.hide()
      } catch (err) {
        reject(err)
      }
    })
  })
  const ipcPromise = new Promise((resolve, reject) => {
    try {
      if (
        !ipcs.serverIpc ||
        typeof ipcs.serverIpc !== 'object'
      ) {
        resolve()

        return
      }

      ipcs.serverIpc.once('close', () => {
        resolve()
      })

      ipcs.serverIpc.kill('SIGINT')
    } catch (err) {
      reject(err)
    }
  })

  return Promise.all([ipcPromise, ...promises])
}
