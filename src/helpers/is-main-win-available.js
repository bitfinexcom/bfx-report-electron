'use strict'

const wins = require('../window-creators/windows')
const WINDOW_NAMES = require('../window-creators/window.names')

module.exports = (
  win = wins?.[WINDOW_NAMES.MAIN_WINDOW],
  opts = {}
) => {
  return (
    win &&
    typeof win === 'object' &&
    !win.isDestroyed() &&
    (
      !opts?.shouldCheckVisibility ||
      win.isVisible()
    )
  )
}
