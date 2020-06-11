'use strict'

const electron = require('electron')

const { getConfigsKeeperByName } = require('./configs-keeper')

module.exports = (options) => {
  const screen = electron.screen || electron.remote.screen

  let state = null
  let winRef = null
  let stateChangeTimer = null

  const eventHandlingDelay = 100
  const config = {
    maximize: true,
    fullScreen: true,
    ...options
  }

  const isNormal = (win) => {
    return !win.isMaximized() &&
      !win.isMinimized() &&
      !win.isFullScreen()
  }

  const hasBounds = () => {
    return state &&
      Number.isInteger(state.x) &&
      Number.isInteger(state.y) &&
      Number.isInteger(state.width) && state.width > 0 &&
      Number.isInteger(state.height) && state.height > 0
  }

  const resetStateToDefault = () => {
    const point = electron.screen.getCursorScreenPoint()
    const displayBounds = electron.screen.getDisplayNearestPoint(point)

    state = {
      width: config.defaultWidth || 800,
      height: config.defaultHeight || 600,
      x: 0,
      y: 0,
      displayBounds
    }
  }

  const ensureWindowVisibleOnSomeDisplay = () => {
    const {
      maxWidth,
      maxHeight
    } = electron.screen.getAllDisplays().reduce((
      { maxWidth, maxHeight },
      { workAreaSize: { width, height } }
    ) => {
      return {
        maxWidth: maxWidth + width,
        maxHeight: maxHeight + height
      }
    }, { maxWidth: 0, maxHeight: 0 })
    const visible = state.x < maxWidth && state.y < maxHeight

    if (!visible) {
      return resetStateToDefault()
    }
  }

  const validateState = () => {
    const isValid = (
      state &&
      (
        hasBounds() ||
        state.isMaximized ||
        state.isFullScreen
      )
    )

    if (!isValid) {
      state = null

      return
    }

    if (hasBounds() && state.displayBounds) {
      ensureWindowVisibleOnSomeDisplay()
    }
  }

  const updateState = (win) => {
    win = win || winRef

    if (!win) {
      return
    }

    try {
      const winBounds = win.getBounds()

      if (isNormal(win)) {
        state.x = winBounds.x
        state.y = winBounds.y
        state.width = winBounds.width
        state.height = winBounds.height
      }

      state.isMaximized = win.isMaximized()
      state.isFullScreen = win.isFullScreen()
      state.displayBounds = screen.getDisplayMatching(winBounds).bounds
    } catch (err) {}
  }

  const saveState = (win) => {
    if (win) {
      updateState(win)
    }

    getConfigsKeeperByName('main')
      .setConfigs({ windowState: state })
      .saveConfigsSync()
  }

  const stateChangeHandler = () => {
    clearTimeout(stateChangeTimer)
    stateChangeTimer = setTimeout(updateState, eventHandlingDelay)
  }

  const closeHandler = () => {
    updateState()
  }

  const closedHandler = () => {
    unmanage()
    saveState()
  }

  const manage = (win) => {
    if (config.fullScreen && state.isFullScreen) {
      win.setFullScreen(true)
    }

    win.on('resize', stateChangeHandler)
    win.on('move', stateChangeHandler)
    win.on('close', closeHandler)
    win.on('closed', closedHandler)

    winRef = win
  }

  const unmanage = () => {
    if (winRef) {
      winRef.removeListener('resize', stateChangeHandler)
      winRef.removeListener('move', stateChangeHandler)
      clearTimeout(stateChangeTimer)
      winRef.removeListener('close', closeHandler)
      winRef.removeListener('closed', closedHandler)
      winRef = null
    }
  }

  state = getConfigsKeeperByName('main')
    .getConfigByName('windowState')

  validateState()

  state = {
    width: config.defaultWidth || 800,
    height: config.defaultHeight || 600,
    ...state
  }

  return {
    get x () { return state.x },
    get y () { return state.y },
    get width () { return state.width },
    get height () { return state.height },
    get displayBounds () { return state.displayBounds },
    get isMaximized () { return state.isMaximized },
    get isFullScreen () { return state.isFullScreen },
    saveState,
    unmanage,
    manage,
    resetStateToDefault
  }
}
