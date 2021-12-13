'use strict'

const wins = require('../windows')

module.exports = (win = wins?.mainWindow) => {
  return (
    win &&
    typeof win === 'object' &&
    !win.isDestroyed()
  )
}
