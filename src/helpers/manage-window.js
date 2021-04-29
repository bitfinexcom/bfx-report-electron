'use strict'

const hideWindow = (win) => {
  return new Promise((resolve, reject) => {
    try {
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

      win.hide()
    } catch (err) {
      reject(err)
    }
  })
}

const showWindow = (win) => {
  return new Promise((resolve, reject) => {
    try {
      if (
        !win ||
        typeof win !== 'object' ||
        win.isDestroyed() ||
        win.isVisible()
      ) {
        resolve()

        return
      }

      win.once('show', resolve)

      win.show()
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = {
  hideWindow,
  showWindow
}
