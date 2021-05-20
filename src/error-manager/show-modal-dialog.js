'use strict'

const { app, dialog } = require('electron')

// TODO:
module.exports = async (params) => {
  const {
    errBoxTitle = 'Bug report',
    errBoxDescription = 'A new Github issue will be opened',
    mdIssue
  } = params

  // TODO: Needs to add BrowserWindow to render markdown converted to html
  if (app.isReady()) {
    return {
      isExit: false,
      isReported: true,
      isIgnored: false
    }
  }

  const res = {
    isExit: true,
    isReported: true,
    isIgnored: false
  }

  // If called before the app ready event on Linux,
  // the message will be emitted to stderr,
  // and no GUI dialog will appear
  if (process.platform !== 'linux') {
    dialog.showErrorBox(
      errBoxTitle,
      errBoxDescription
    )

    return res
  }

  // TODO: On Linux needs to spawn zenity gui tool to show error

  return res
}
