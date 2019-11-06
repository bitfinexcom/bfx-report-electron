'use strict'

const wins = require('./windows')
const { serverIpc } = require('./ipcs')

const _showLoadingWindow = () => {
  if (
    !wins.loadingWindow ||
    typeof wins.loadingWindow !== 'object' ||
    wins.loadingWindow.isDestroyed() ||
    wins.loadingWindow.isVisible()
  ) {
    return
  }

  wins.loadingWindow.show()
}

module.exports = () => {
  _showLoadingWindow()

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
        !serverIpc ||
        typeof serverIpc !== 'object'
      ) {
        resolve()

        return
      }

      serverIpc.once('close', () => {
        resolve()
      })

      serverIpc.kill('SIGINT')
    } catch (err) {
      reject(err)
    }
  })

  return Promise.all([ipcPromise, ...promises])
}
