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
const WINDOW_NAMES = require('./window.names')

let intervalMarker

const _closeAllWindows = () => {
  const _wins = BrowserWindow.getAllWindows()
    .filter((win) => win !== wins.loadingWindow)

  const promises = _wins.map((win) => hideWindow(win))

  return Promise.all(promises)
}

const setParentToStartupLoadingWindow = (noParent) => {
  // TODO: The reason for it related to the electronjs issue:
  // `[Bug]: Wrong main window hidden state on macOS when using 'parent' option`
  // https://github.com/electron/electron/issues/29732
  if (process.platform === 'darwin') {
    return
  }

  if (wins[WINDOW_NAMES.STARTUP_LOADING_WINDOW].isFocused()) {
    return
  }

  const win = BrowserWindow.getFocusedWindow()

  if (noParent) {
    wins[WINDOW_NAMES.STARTUP_LOADING_WINDOW].setParentWindow(null)

    return
  }
  if (
    Object.values(wins).every((w) => w !== win) ||
    win === wins[WINDOW_NAMES.STARTUP_LOADING_WINDOW]
  ) {
    const mainWindow = !wins[WINDOW_NAMES.MAIN_WINDOW]?.isDestroyed()
      ? wins[WINDOW_NAMES.MAIN_WINDOW]
      : null

    wins[WINDOW_NAMES.STARTUP_LOADING_WINDOW]
      .setParentWindow(mainWindow)

    return
  }

  wins[WINDOW_NAMES.STARTUP_LOADING_WINDOW].setParentWindow(win)
}

const _runProgressLoader = (opts) => {
  const {
    win = wins.loadingWindow,
    isIndeterminateMode = false,
    progress
  } = opts ?? {}

  if (
    !win ||
    typeof win !== 'object' ||
    win.isDestroyed()
  ) {
    return
  }
  if (Number.isFinite(progress)) {
    if (
      progress >= 1 &&
      !isIndeterminateMode
    ) {
      win.setProgressBar(-0.1)

      return
    }

    win.setProgressBar(progress)

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
  let _progress = 0

  intervalMarker = setInterval(() => {
    if (_progress >= 1) {
      _progress = 0
    }

    _progress += step

    if (
      !win ||
      typeof win !== 'object' ||
      win.isDestroyed()
    ) {
      clearInterval(intervalMarker)

      return
    }

    win.setProgressBar(_progress)
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

const setLoadingDescription = async (params) => {
  try {
    const {
      win = wins.loadingWindow,
      progress,
      description = ''
    } = params ?? {}

    if (
      !win ||
      typeof win !== 'object' ||
      win.isDestroyed() ||
      typeof description !== 'string'
    ) {
      return
    }

    const _progressPerc = (
      Number.isFinite(progress) &&
      progress > 0
    )
      ? Math.floor(progress * 100)
      : null
    const progressPerc = (
      Number.isFinite(_progressPerc) &&
      _progressPerc > 100
    )
      ? 100
      : _progressPerc
    const descriptionChunk = description
      ? `<p>${description}</p>`
      : '<p></p>'
    const progressChunk = Number.isFinite(progressPerc)
      ? `<p>${progressPerc} %</p>`
      : '<p></p>'
    const _description = `${progressChunk}${descriptionChunk}`

    const loadingDescReadyPromise = GeneralIpcChannelHandlers
      .onLoadingDescriptionReady()

    GeneralIpcChannelHandlers
      .sendLoadingDescription(win, { description: _description })

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
    progress,
    description = '',
    isRequiredToCloseAllWins = false,
    isNotRunProgressLoaderRequired = false,
    isIndeterminateMode = false,
    noParent = false,
    shouldCloseBtnBeShown,
    shouldMinimizeBtnBeShown
  } = opts ?? {}

  if (
    !wins.loadingWindow ||
    typeof wins.loadingWindow !== 'object' ||
    wins.loadingWindow.isDestroyed()
  ) {
    await require('.')
      .createLoadingWindow()
  }

  setParentToStartupLoadingWindow(isRequiredToCloseAllWins || noParent)

  const _progress = Number.isFinite(progress)
    ? Math.floor(progress * 100) / 100
    : progress

  if (
    !isNotRunProgressLoaderRequired ||
    Number.isFinite(progress)
  ) {
    _runProgressLoader({ progress: _progress, isIndeterminateMode })
  }

  GeneralIpcChannelHandlers
    .sendLoadingBtnStates(wins.loadingWindow, {
      shouldCloseBtnBeShown: shouldCloseBtnBeShown ?? false,
      shouldMinimizeBtnBeShown: shouldMinimizeBtnBeShown ?? false
    })
  await setLoadingDescription({ progress: _progress, description })

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
  await setLoadingDescription({ description: '' })
  _stopProgressLoader()

  if (isRequiredToShowMainWin) {
    await showWindow(
      wins.mainWindow,
      { shouldWinBeFocused: true }
    )

    if (appStates.isMainWinMaximized) {
      wins.mainWindow.maximize()
    }
    if (appStates.isMainWinFullScreen) {
      wins.mainWindow.setFullScreen(true)
    }
  }

  return hideWindow(
    wins.loadingWindow,
    { shouldWinBeBlurred: true }
  )
}

module.exports = {
  showLoadingWindow,
  hideLoadingWindow,
  setLoadingDescription,
  setParentToStartupLoadingWindow
}
