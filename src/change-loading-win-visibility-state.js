'use strict'

const electron = require('electron')

const wins = require('./windows')
const {
  hideWindow,
  showWindow
} = require('./helpers/manage-window')

let intervalMarker

const _closeAllWindows = () => {
  const _wins = electron.BrowserWindow
    .getAllWindows()
    .filter((win) => win !== wins.loadingWindow)

  const promises = _wins.map((win) => hideWindow(win))

  return Promise.all(promises)
}

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

const _runProgressLoader = (
  win = wins.loadingWindow
) => {
  const duration = 3000 // ms
  const interval = 500 // ms
  const step = 1 / (duration / interval)
  let progress = 0

  intervalMarker = setInterval(() => {
    if (progress >= 1) {
      progress = 0
    }

    progress += step

    if (
      !win ||
      typeof win !== 'object' ||
      win.isDestroyed()
    ) {
      clearInterval(intervalMarker)

      return
    }

    win.setProgressBar(progress)
  }, interval).unref()
}

const _stopProgressLoader = (
  win = wins.loadingWindow
) => {
  clearInterval(intervalMarker)

  if (
    !win ||
    typeof win !== 'object' ||
    win.isDestroyed()
  ) {
    return
  }

  win.setProgressBar(-1)
}

const showLoadingWindow = async (opts = {}) => {
  const {
    isRequiredToCloseAllWins = false,
    isNotRunProgressLoaderRequired = false,
    noParent = false
  } = { ...opts }

  if (isRequiredToCloseAllWins) {
    _closeAllWindows()
  }

  const screen = electron.screen || electron.remote.screen
  const {
    getCursorScreenPoint,
    getDisplayNearestPoint
  } = screen

  if (
    !wins.loadingWindow ||
    typeof wins.loadingWindow !== 'object' ||
    wins.loadingWindow.isDestroyed()
  ) {
    await require('./window-creators')
      .createLoadingWindow()
  }

  _setParentWindow(isRequiredToCloseAllWins || noParent)

  if (!isNotRunProgressLoaderRequired) {
    _runProgressLoader()
  }

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

  return showWindow(wins.loadingWindow)
}

const hideLoadingWindow = async (opts = {}) => {
  const {
    isRequiredToShowMainWin = false
  } = { ...opts }

  if (isRequiredToShowMainWin) {
    await showWindow(wins.mainWindow)
  }

  _stopProgressLoader()

  return hideWindow(wins.loadingWindow)
}

module.exports = {
  showLoadingWindow,
  hideLoadingWindow
}
