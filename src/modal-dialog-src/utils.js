'use strict'

const closeAlert = (alert) => {
  if (
    !alert ||
    typeof alert !== 'object' ||
    !alert.browserWindow
  ) return

  alert.browserWindow.hide()
  alert.browserWindow.close()
}

module.exports = {
  closeAlert
}
