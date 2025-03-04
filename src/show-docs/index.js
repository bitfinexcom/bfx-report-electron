'use strict'

const { app, screen, remote } = require('electron')
const fs = require('fs')
const path = require('path')
const { Converter } = require('showdown')
const Alert = require('electron-alert')
const { rootPath } = require('electron-root-path')
const i18next = require('i18next')

const wins = require('../window-creators/windows')
const isMainWinAvailable = require(
  '../helpers/is-main-win-available'
)
const getAlertCustomClassObj = require(
  '../helpers/get-alert-custom-class-obj'
)
const {
  closeAlert
} = require('../modal-dialog-src/utils')
const { UserManualShowingError } = require('../errors')
const getUIFontsAsCSSString = require(
  '../helpers/get-ui-fonts-as-css-string'
)

const {
  WINDOW_EVENT_NAMES,
  addOnceProcEventHandler
} = require('../window-creators/window-event-manager')
const ThemeIpcChannelHandlers = require(
  '../window-creators/main-renderer-ipc-bridge/theme-ipc-channel-handlers'
)

const mdStyle = fs.readFileSync(path.join(
  rootPath, 'node_modules', 'github-markdown-css/github-markdown.css'
))
const fontsStyle = getUIFontsAsCSSString()
const themesStyle = fs.readFileSync(path.join(
  __dirname, '../window-creators/layouts/themes.css'
))
const alertStyle = fs.readFileSync(path.join(
  __dirname, '../modal-dialog-src/modal-dialog.css'
))
const alertScript = fs.readFileSync(path.join(
  __dirname, '../modal-dialog-src/modal-dialog.js'
))

const fonts = `<style>${fontsStyle}</style>`
const themes = `<style>${themesStyle}</style>`
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

const _fireAlert = (params) => {
  const {
    type = 'info',
    title = i18next.t('showDocs.modalDialog.title'),
    html
  } = params
  const win = wins.mainWindow

  if (!isMainWinAvailable()) {
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

  const alert = new Alert([mdS, fonts, themes, style, script])

  const eventHandlerCtx = addOnceProcEventHandler(
    WINDOW_EVENT_NAMES.CLOSED,
    () => closeAlert(alert)
  )

  const bwOptions = {
    frame: false,
    transparent: false,
    thickFrame: false,
    closable: false,
    hasShadow: false,
    backgroundColor: ThemeIpcChannelHandlers.getWindowBackgroundColor(),
    darkTheme: false,
    parent: win,
    modal: true,
    width: 1000
  }
  const swalOptions = {
    position: 'center',
    allowOutsideClick: false,
    customClass: getAlertCustomClassObj({
      htmlContainer: 'markdown-body'
    }),

    type,
    title,
    html,
    showConfirmButton: false,
    focusCancel: true,
    showCancelButton: true,
    cancelButtonText: i18next.t('showDocs.modalDialog.cancelButtonText'),
    timerProgressBar: false,

    willOpen: () => {
      if (
        !alert ||
        !alert.browserWindow
      ) return

      alert.browserWindow.hide()
    },
    didOpen: () => {
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
    willClose: () => {
      if (
        !alert ||
        !alert.browserWindow
      ) return

      alert.browserWindow.hide()
    },
    didClose: () => {
      eventHandlerCtx.removeListener()
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
      type,
      title,
      mdDoc = i18next.t('mdDocs:userManual')
    } = params

    if (
      !app.isReady() ||
      !isMainWinAvailable()
    ) {
      throw new UserManualShowingError()
    }

    const html = converter.makeHtml(mdDoc)

    await _fireAlert({ type, title, html })
  } catch (err) {
    console.error(err)
  }
}
