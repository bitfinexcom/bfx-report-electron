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

const intervalMap = new Map()

const _closeAllWindows = (opts) => {
  const excepedWindowName = opts?.excepedWindowName ?? WINDOW_NAMES.STARTUP_LOADING_WINDOW
  const excepedWin = wins[excepedWindowName]
  const _wins = BrowserWindow.getAllWindows()
    .filter((win) => win !== excepedWin)

  const promises = _wins.map((win) => hideWindow(win))

  return Promise.all(promises)
}

const setParentToLoadingWindow = (opts) => {
  const {
    windowName = WINDOW_NAMES.STARTUP_LOADING_WINDOW,
    noParent
  } = opts ?? {}

  // TODO: The reason for it related to the electronjs issue:
  // `[Bug]: Wrong main window hidden state on macOS when using 'parent' option`
  // https://github.com/electron/electron/issues/29732
  if (process.platform === 'darwin') {
    return
  }

  if (wins[windowName].isFocused()) {
    return
  }

  const win = BrowserWindow.getFocusedWindow()

  if (noParent) {
    wins[windowName].setParentWindow(null)

    return
  }
  if (
    Object.values(wins).every((w) => w !== win) ||
    win === wins[windowName]
  ) {
    const mainWindow = !wins[WINDOW_NAMES.MAIN_WINDOW]?.isDestroyed()
      ? wins[WINDOW_NAMES.MAIN_WINDOW]
      : null

    wins[windowName]
      .setParentWindow(mainWindow)

    return
  }

  wins[windowName].setParentWindow(win)
}

const _runProgressLoader = (opts) => {
  const {
    windowName = WINDOW_NAMES.STARTUP_LOADING_WINDOW,
    isIndeterminateMode = false,
    progress
  } = opts ?? {}
  const win = wins[windowName]

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

  const intervalMarker = setInterval(() => {
    if (_progress >= 1) {
      _progress = 0
    }

    _progress += step

    if (
      !win ||
      typeof win !== 'object' ||
      win.isDestroyed()
    ) {
      const intervalMarker = intervalMap.get(windowName)
      clearInterval(intervalMarker)

      return
    }

    win.setProgressBar(_progress)
  }, interval).unref()

  intervalMap.set(windowName, intervalMarker)
}

const _stopProgressLoader = (opts) => {
  const {
    windowName = WINDOW_NAMES.STARTUP_LOADING_WINDOW
  } = opts ?? {}
  const win = wins[windowName]
  const intervalMarker = intervalMap.get(windowName)

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
      windowName = WINDOW_NAMES.STARTUP_LOADING_WINDOW,
      progress,
      description = ''
    } = params ?? {}
    const win = wins[windowName]

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

    const loadingDescReadyPromise = windowName === WINDOW_NAMES.LOADING_WINDOW
      ? GeneralIpcChannelHandlers.onLoadingDescriptionReady()
      : GeneralIpcChannelHandlers.onStartupLoadingDescriptionReady()

    if (windowName === WINDOW_NAMES.LOADING_WINDOW) {
      GeneralIpcChannelHandlers
        .sendLoadingDescription(win, { description: _description })
    }
    if (windowName === WINDOW_NAMES.STARTUP_LOADING_WINDOW) {
      GeneralIpcChannelHandlers
        .sendStartupLoadingDescription(win, { description: _description })
    }

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
    shouldMinimizeBtnBeShown,
    windowName = WINDOW_NAMES.STARTUP_LOADING_WINDOW
  } = opts ?? {}
  const win = wins[windowName]

  if (
    !win ||
    typeof win !== 'object' ||
    win.isDestroyed()
  ) {
    if (windowName === WINDOW_NAMES.LOADING_WINDOW) {
      await require('.').createLoadingWindow()
    }
    if (windowName === WINDOW_NAMES.STARTUP_LOADING_WINDOW) {
      await require('.').createStartupLoadingWindow()
    }
  }
  if (windowName === WINDOW_NAMES.STARTUP_LOADING_WINDOW) {
    setParentToLoadingWindow({
      windowName: WINDOW_NAMES.STARTUP_LOADING_WINDOW,
      noParent: isRequiredToCloseAllWins || noParent
    })
  }

  const _progress = Number.isFinite(progress)
    ? Math.floor(progress * 100) / 100
    : progress

  if (
    !isNotRunProgressLoaderRequired ||
    Number.isFinite(progress)
  ) {
    _runProgressLoader({
      windowName,
      progress: _progress,
      isIndeterminateMode
    })
  }

  const btnOpts = {
    shouldCloseBtnBeShown: shouldCloseBtnBeShown ?? false,
    shouldMinimizeBtnBeShown: shouldMinimizeBtnBeShown ?? false
  }

  if (windowName === WINDOW_NAMES.LOADING_WINDOW) {
    GeneralIpcChannelHandlers.sendLoadingBtnStates(win, btnOpts)
  }
  if (windowName === WINDOW_NAMES.STARTUP_LOADING_WINDOW) {
    GeneralIpcChannelHandlers.sendStartupLoadingBtnStates(win, btnOpts)
  }

  await setLoadingDescription({
    windowName,
    progress: _progress,
    description
  })

  if (!win.isVisible()) {
    centerWindow(win)

    await showWindow(win)
  }
  if (!isRequiredToCloseAllWins) {
    return
  }

  await _closeAllWindows({ excepedWindowName: windowName })
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
  setParentToLoadingWindow
}
