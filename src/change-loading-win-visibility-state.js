'use strict'

const electron = require('electron')

const wins = require('./windows')

const showLoadingWindow = async () => {
  if (
    !wins.loadingWindow ||
    typeof wins.loadingWindow !== 'object' ||
    wins.loadingWindow.isDestroyed()
  ) {
    return
  }
  if (!wins.loadingWindow.isFocused()) {
    const win = electron.BrowserWindow.getFocusedWindow()

    wins.loadingWindow.setParentWindow(win)
  }
  if (wins.loadingWindow.isVisible()) {
    return
  }

  return new Promise((resolve, reject) => {
    try {
      wins.loadingWindow.once('show', resolve)
      wins.loadingWindow.show()
    } catch (err) {
      reject(err)
    }
  })
}

const hideLoadingWindow = async () => {
  if (
    !wins.loadingWindow ||
    typeof wins.loadingWindow !== 'object' ||
    wins.loadingWindow.isDestroyed() ||
    !wins.loadingWindow.isVisible()
  ) {
    return
  }

  return new Promise((resolve, reject) => {
    try {
      wins.loadingWindow.once('hide', resolve)
      wins.loadingWindow.hide()
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = {
  showLoadingWindow,
  hideLoadingWindow
}
