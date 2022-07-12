'use strict'

const wins = require('../windows')

module.exports = (
  win = wins?.mainWindow,
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
