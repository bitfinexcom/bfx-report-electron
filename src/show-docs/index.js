'use strict'

const { app, screen, remote } = require('electron')
const fs = require('fs')
const path = require('path')
const { Converter } = require('showdown')
const Alert = require('electron-alert')
const { rootPath } = require('electron-root-path')

const wins = require('../windows')
const { UserManualShowingError } = require('../errors')

const mdUserManual = fs.readFileSync(
  path.join(rootPath, 'docs/user-manual.md'),
  'utf8'
)

const mdStyle = fs.readFileSync(path.join(
  rootPath, 'node_modules', 'github-markdown-css/github-markdown.css'
))
const fontsStyle = fs.readFileSync(path.join(
  rootPath, 'bfx-report-ui/build/fonts/roboto.css'
))
const alertStyle = fs.readFileSync(path.join(
  __dirname, '../modal-dialog-src/modal-dialog.css'
))
const alertScript = fs.readFileSync(path.join(
  __dirname, '../modal-dialog-src/modal-dialog.js'
))

const fonts = `<style>${fontsStyle}</style>`
const mdS = `<style>${mdStyle}</style>`
const style = `<style>${alertStyle}</style>`
const script = `<script type="text/javascript">${alertScript}</script>`
const sound = { freq: 'F2', type: 'triange', duration: 1.5 }

const converter = new Converter({
  tables: true,
  strikethrough: true,
  tasklists: true,
  disableForced4SpacesIndentedSublists: true,
  requireSpaceBeforeHeadingText: true
})

const _isMainWinAvailable = () => {
  return (
    wins.mainWindow &&
    typeof wins.mainWindow === 'object' &&
    !wins.mainWindow.isDestroyed()
  )
}

const _closeAlert = (alert) => {
  if (
    !alert ||
    !alert.browserWindow
  ) return

  alert.browserWindow.hide()
  alert.browserWindow.close()
}

const _fireAlert = (params) => {
  const {
    title = 'User manual',
    html
  } = params
  const win = wins.mainWindow

  if (!_isMainWinAvailable()) {
    return { value: false }
  }

  const _screen = screen || remote.screen
  const {
    getCursorScreenPoint,
    getDisplayNearestPoint
  } = _screen
  const {
    workArea
  } = getDisplayNearestPoint(getCursorScreenPoint())
  const { height: screenHeight } = workArea
  const maxHeight = Math.floor(screenHeight * 0.90)

  const alert = new Alert([mdS, fonts, style, script])
  const _close = () => _closeAlert(alert)

  win.once('closed', _close)

  const bwOptions = {
    frame: false,
    transparent: false,
    thickFrame: false,
    closable: false,
    hasShadow: false,
    backgroundColor: '#172d3e',
    darkTheme: false,
    parent: win,
    modal: true,
    width: 1000,
    webPreferences: {
      contextIsolation: false
    }
  }
  const swalOptions = {
    position: 'center',
    allowOutsideClick: false,
    backdrop: 'rgba(0,0,0,0.0)',
    customClass: {
      content: 'markdown-body'
    },

    type: 'info',
    title,
    html,
    showConfirmButton: false,
    focusCancel: true,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    timerProgressBar: false,

    onBeforeOpen: () => {
      if (
        !alert ||
        !alert.browserWindow
      ) return

      alert.browserWindow.hide()
    },
    onOpen: () => {
      if (
        !alert ||
        !alert.browserWindow
      ) return

      alert.browserWindow.show()
      const { height } = alert.browserWindow
        .getContentBounds()
      alert.browserWindow.setBounds({
        height: height > maxHeight
          ? maxHeight
          : height
      })
    },
    onClose: () => {
      if (
        !alert ||
        !alert.browserWindow
      ) return

      alert.browserWindow.hide()
    },
    onAfterClose: () => {
      win.removeListener('closed', _close)
    }
  }

  const res = alert.fire(
    swalOptions,
    bwOptions,
    null,
    true,
    false,
    sound
  )

  return res
}

module.exports = async (params = {}) => {
  try {
    const {
      mdDoc = mdUserManual
    } = params

    if (
      !app.isReady() ||
      !_isMainWinAvailable()
    ) {
      throw new UserManualShowingError()
    }

    const html = converter.makeHtml(mdDoc)

    await _fireAlert({ html })
  } catch (err) {
    console.error(err)
  }
}
