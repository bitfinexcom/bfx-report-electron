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

const mdUserManual = fs.readFileSync(
  path.join(rootPath, 'docs/user-manual.md'),
  'utf8'
)
const {
  WINDOW_EVENT_NAMES,
  addOnceProcEventHandler
} = require('../window-creators/window-event-manager')

const mdStyle = fs.readFileSync(path.join(
  rootPath, 'node_modules', 'github-markdown-css/github-markdown.css'
))
const fontsStyle = getUIFontsAsCSSString()
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

const _fireAlert = (params) => {
  const {
    type = 'info',
    title = i18next.t('common.showDocs.modalDialog.title'),
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

  const alert = new Alert([mdS, fonts, style, script])

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
    backgroundColor: '#172d3e',
    darkTheme: false,
    parent: win,
    modal: true,
    width: 1000
  }
  const swalOptions = {
    position: 'center',
    allowOutsideClick: false,
    backdrop: 'rgba(0,0,0,0.0)',
    customClass: getAlertCustomClassObj({
      htmlContainer: 'markdown-body'
    }),

    type,
    title,
    html,
    showConfirmButton: false,
    focusCancel: true,
    showCancelButton: true,
    cancelButtonText: i18next.t('common.showDocs.modalDialog.cancelButtonText'),
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
      mdDoc = mdUserManual
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
