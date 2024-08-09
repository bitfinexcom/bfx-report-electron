'use strict'

const { screen } = require('electron')

const hideWindow = (win, opts) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        shouldWinBeBlurred = false
      } = opts ?? {}

      if (
        !win ||
        typeof win !== 'object' ||
        win.isDestroyed() ||
        !win.isVisible()
      ) {
        resolve()

        return
      }

      win.once('hide', resolve)

      if (shouldWinBeBlurred) {
        win.blur()
      }

      win.hide()
    } catch (err) {
      reject(err)
    }
  })
}

const showWindow = (win, opts) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        shouldWinBeShownInactive = false,
        shouldWinBeFocused = false
      } = opts ?? {}

      if (
        !win ||
        typeof win !== 'object' ||
        win.isDestroyed() ||
        win.isVisible()
      ) {
        resolve()

        return
      }

      win.once('show', () => {
        if (shouldWinBeFocused) {
          win.focus()
        }

        resolve()
      })

      if (shouldWinBeShownInactive) {
        win.showInactive()

        return
      }

      win.show()
    } catch (err) {
      reject(err)
    }
  })
}

const centerWindow = (win, workArea) => {
  const {
    getCursorScreenPoint,
    getDisplayNearestPoint
  } = screen

  // doesn't center the window on mac
  // https://github.com/electron/electron/issues/26362
  // https://github.com/electron/electron/issues/22324
  win.center()

  const _workArea = (
    workArea &&
    typeof workArea === 'object' &&
    Number.isFinite(workArea.width) &&
    Number.isFinite(workArea.height) &&
    Number.isFinite(workArea.x) &&
    Number.isFinite(workArea.y)
  )
    ? workArea
    : getDisplayNearestPoint(getCursorScreenPoint()).workArea

  const { width, height } = win.getContentBounds()
  const {
    width: screenWidth,
    height: screenHeight,
    x,
    y
  } = _workArea

  const boundsOpts = {
    x: Math.round(x + ((screenWidth - width) / 2)),
    y: Math.round(y + (screenHeight - height) / 2)
  }

  win.setBounds(boundsOpts)
}

const isWindowInvisible = (win) => {
  return (
    !win?.isVisible() ||
    !win?.isFocused()
  )
}

module.exports = {
  hideWindow,
  showWindow,
  centerWindow,
  isWindowInvisible
}
