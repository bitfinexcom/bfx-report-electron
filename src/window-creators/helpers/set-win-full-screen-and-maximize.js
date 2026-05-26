'use strict'

module.exports = (win, opts) => {
  const {
    show,
    isFullScreen,
    isMaximized
  } = opts ?? {}

  if (show) {
    win.setFullScreen(isFullScreen)

    if (isMaximized) {
      win.maximize()

      return
    }

    win.unmaximize()

    return
  }

  win.once('show', () => {
    win.setFullScreen(isFullScreen)

    if (isMaximized) {
      win.maximize()

      return
    }

    win.unmaximize()
  })
}
