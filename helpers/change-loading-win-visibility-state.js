'use strict'

const wins = require('./windows')

const showLoadingWindow = () => {
  if (
    !wins.loadingWindow ||
    typeof wins.loadingWindow !== 'object' ||
    wins.loadingWindow.isDestroyed() ||
    wins.loadingWindow.isVisible()
  ) {
    return
  }

  wins.loadingWindow.show()
}

const hideLoadingWindow = () => {
  if (
    !wins.loadingWindow ||
    typeof wins.loadingWindow !== 'object' ||
    wins.loadingWindow.isDestroyed() ||
    !wins.loadingWindow.isVisible()
  ) {
    return
  }

  wins.loadingWindow.hide()
}

module.exports = {
  showLoadingWindow,
  hideLoadingWindow
}
