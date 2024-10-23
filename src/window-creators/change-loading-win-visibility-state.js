'use strict'

const { BrowserWindow } = require('electron')

const wins = require('./windows')
const appStates = require('../app-states')
const {
  hideWindow,
  showWindow,
  centerWindow
} = require('../helpers/manage-window')
const GeneralIpcChannelHandlers = require(
  './main-renderer-ipc-bridge/general-ipc-channel-handlers'
)

let intervalMarker

const _closeAllWindows = () => {
  const _wins = BrowserWindow.getAllWindows()
    .filter((win) => win !== wins.loadingWindow)

  const promises = _wins.map((win) => hideWindow(win))

  return Promise.all(promises)
}

const _setParentWindow = (noParent) => {
  // TODO: The reason for it related to the electronjs issue:
  // `[Bug]: Wrong main window hidden state on macOS when using 'parent' option`
  // https://github.com/electron/electron/issues/29732
  if (process.platform === 'darwin') {
    return
  }

  if (wins.loadingWindow.isFocused()) {
    return
  }

  const win = BrowserWindow.getFocusedWindow()

  if (noParent) {
    wins.loadingWindow.setParentWindow(null)

    return
  }
  if (
    Object.values(wins).every((w) => w !== win) ||
    win === wins.loadingWindow
  ) {
    const mainWindow = !wins.mainWindow?.isDestroyed()
      ? wins.mainWindow
      : null

    wins.loadingWindow.setParentWindow(mainWindow)

    return
  }

  wins.loadingWindow.setParentWindow(win)
}

const _runProgressLoader = (opts = {}) => {
  const {
    win = wins.loadingWindow,
    isIndeterminateMode = false
  } = { ...opts }

  if (
    !win ||
    typeof win !== 'object' ||
    win.isDestroyed()
  ) {
    return
  }
  if (isIndeterminateMode) {
    // Change to indeterminate mode when progress > 1
    win.setProgressBar(1.1)

    return
  }

  const fps = 50
  const duration = 3000 // ms
  const interval = duration / fps // ms
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

  // Remove progress bar when progress < 0
  win.setProgressBar(-0.1)
}

const _setLoadingDescription = async (win, description) => {
  try {
    if (
      !win ||
      typeof win !== 'object' ||
      win.isDestroyed() ||
      typeof description !== 'string'
    ) {
      return
    }

    const loadingDescReadyPromise = GeneralIpcChannelHandlers
      .onLoadingDescriptionReady()

    GeneralIpcChannelHandlers
      .sendLoadingDescription(win, { description })

    const loadingRes = await loadingDescReadyPromise

    if (loadingRes?.err) {
      console.error(loadingRes?.err)
    }
  } catch (err) {
    console.error(err)
  }
}

const showLoadingWindow = async (opts) => {
  const {
    description = '',
    isRequiredToCloseAllWins = false,
    isNotRunProgressLoaderRequired = false,
    isIndeterminateMode = false,
    noParent = false
  } = opts ?? {}

  if (
    !wins.loadingWindow ||
    typeof wins.loadingWindow !== 'object' ||
    wins.loadingWindow.isDestroyed()
  ) {
    await require('.')
      .createLoadingWindow()
  }

  _setParentWindow(isRequiredToCloseAllWins || noParent)

  if (!isNotRunProgressLoaderRequired) {
    _runProgressLoader({ isIndeterminateMode })
  }

  await _setLoadingDescription(
    wins.loadingWindow,
    description
  )

  if (!wins.loadingWindow.isVisible()) {
    centerWindow(wins.loadingWindow)

    await showWindow(wins.loadingWindow)
  }
  if (!isRequiredToCloseAllWins) {
    return
  }

  await _closeAllWindows()
}

const hideLoadingWindow = async (opts) => {
  const {
    isRequiredToShowMainWin = false
  } = opts ?? {}

  // need to empty description
  await _setLoadingDescription(
    wins.loadingWindow,
    ''
  )
  _stopProgressLoader()

  if (isRequiredToShowMainWin) {
    await showWindow(
      wins.mainWindow,
      { shouldWinBeFocused: true }
    )

    // Legacy fix related to reprodducing the same behavior on all OS,
    // waiting for checks that it was resolved in the last electron ver
    if (appStates.isMainWinMaximized) {
      wins.mainWindow.maximize()
    }
  }

  return hideWindow(
    wins.loadingWindow,
    { shouldWinBeBlurred: true }
  )
}

module.exports = {
  showLoadingWindow,
  hideLoadingWindow
}
