'use strict'

const { app, dialog, screen } = require('electron')
const fs = require('fs')
const path = require('path')
const { Converter } = require('showdown')
const Alert = require('electron-alert')
const { rootPath } = require('electron-root-path')

const wins = require('../window-creators/windows')
const spawn = require('../helpers/spawn')
const getAlertCustomClassObj = require(
  '../helpers/get-alert-custom-class-obj'
)
const isMainWinAvailable = require(
  '../helpers/is-main-win-available'
)
const {
  closeAlert
} = require('../modal-dialog-src/utils')
const {
  WINDOW_EVENT_NAMES,
  addOnceProcEventHandler
} = require('../window-creators/window-event-manager')

const mdStyle = fs.readFileSync(path.join(
  rootPath, 'node_modules', 'github-markdown-css/github-markdown.css'
))
const fontsStyle = fs.readFileSync(path.join(
  __dirname, '../../bfx-report-ui/build/fonts/roboto.css'
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

const _fireAlert = (params) => {
  const {
    title = 'Should a bug report be submitted?',
    html = '',
    parentWin,
    hasNoParentWin
  } = params ?? {}
  const win = parentWin ?? wins.mainWindow

  if (
    !hasNoParentWin &&
    !isMainWinAvailable(win)
  ) {
    return { value: false }
  }

  const {
    getCursorScreenPoint,
    getDisplayNearestPoint
  } = screen
  const {
    workArea
  } = getDisplayNearestPoint(getCursorScreenPoint())
  const { height: screenHeight } = workArea
  const maxHeight = Math.floor(screenHeight * 0.90)

  const alert = new Alert([mdS, fonts, style, script])

  const eventHandlerCtx = addOnceProcEventHandler(
    WINDOW_EVENT_NAMES.CLOSED,
    () => closeAlert(alert),
    win
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
    width: 600,
    webPreferences: {
      contextIsolation: false
    }
  }
  const swalOptions = {
    position: 'center',
    allowOutsideClick: false,
    backdrop: 'rgba(0,0,0,0.0)',
    customClass: getAlertCustomClassObj({
      htmlContainer: 'markdown-body'
    }),

    icon: 'question',
    focusConfirm: true,
    showConfirmButton: true,
    confirmButtonText: 'Report',
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    timerProgressBar: false,

    ...params,
    title,
    html,

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

module.exports = async (params) => {
  const {
    errBoxTitle = 'Bug report',
    errBoxDescription = 'A new Github issue will be opened',
    mdIssue,
    alertOpts = {}
  } = params

  if (
    app.isReady() &&
    (
      alertOpts?.hasNoParentWin ||
      isMainWinAvailable(alertOpts?.parentWin ?? wins.mainWindow)
    )
  ) {
    const html = converter.makeHtml(mdIssue)

    const {
      value
    } = await _fireAlert({ html, ...alertOpts })

    return {
      isExit: false,
      isReported: value
    }
  }

  const res = {
    isExit: true,
    isReported: true
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

  // On Linux needs to spawn zenity gui tool to show error
  // If push close btn in menu bar zenity will exit with 1
  // which will cause an error
  try {
    await spawn('zenity', [
      '--error',
      `--title=${errBoxTitle}`,
      `--text=${errBoxDescription}`,
      '--width=800',
      '--ok-label=Report and Exit',
      '--no-markup'
    ])
  } catch (err) {
    console.debug(err)

    return {
      isExit: true,
      isReported: false
    }
  }

  return res
}
