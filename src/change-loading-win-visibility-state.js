'use strict'

const electron = require('electron')

const wins = require('./windows')

const _setParentWindow = (noParent) => {
  if (wins.loadingWindow.isFocused()) {
    return
  }

  const win = electron.BrowserWindow.getFocusedWindow()

  if (
    noParent ||
    Object.values(wins).every((w) => w !== win)
  ) {
    wins.loadingWindow.setParentWindow(null)

    return
  }

  wins.loadingWindow.setParentWindow(win)
}

const showLoadingWindow = async (noParent = false) => {
  const screen = electron.screen || electron.remote.screen
  const { getCursorScreenPoint, getDisplayNearestPoint } = screen

  if (
    !wins.loadingWindow ||
    typeof wins.loadingWindow !== 'object' ||
    wins.loadingWindow.isDestroyed()
  ) {
    return
  }

  _setParentWindow(noParent)

  if (wins.loadingWindow.isVisible()) {
    return
  }

  const {
    workArea
  } = getDisplayNearestPoint(getCursorScreenPoint())
  const {
    height,
    width
  } = wins.loadingWindow.getBounds()
  wins.loadingWindow.setBounds({
    ...workArea,
    height,
    width
  })
  wins.loadingWindow.center()

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
