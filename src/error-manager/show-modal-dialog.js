'use strict'

const { app, dialog } = require('electron')
const { Converter } = require('showdown')
const i18next = require('i18next')

const {
  createModalWindow
} = require('../window-creators')
const wins = require('../window-creators/windows')
const spawn = require('../helpers/spawn')
const isMainWinAvailable = require(
  '../helpers/is-main-win-available'
)

const converter = new Converter({
  tables: true,
  strikethrough: true,
  tasklists: true,
  disableForced4SpacesIndentedSublists: true,
  requireSpaceBeforeHeadingText: true
})

const _fireAlert = async (params) => {
  const {
    title = i18next.t('errorManager.errorModalDialog.title'),
    html = '',
    hasNoParentWin
  } = params ?? {}

  const res = await createModalWindow({
    icon: 'error',
    title,
    text: html,
    textClassName: 'markdown-body',
    showConfirmButton: true,
    confirmButtonText: i18next
      .t('errorManager.errorModalDialog.confirmButtonText'),
    showCancelButton: true,
    cancelButtonText: i18next.t('common.cancelButtonText')
  }, { hasNoParentWin, height: 600 })

  return res
}

module.exports = async (params) => {
  const {
    /*
     * It's important to add default translation here
     * to have a description if an error occurs
     * before the translation init
     */
    errBoxTitle = i18next.t(
      'errorManager.errorModalDialog.errBoxTitle',
      'Bug report'
    ),
    errBoxDescription = i18next.t(
      'errorManager.errorModalDialog.errBoxDescription',
      'A new GitHub issue will be opened'
    ),
    mdIssue,
    alertOpts = {}
  } = params ?? {}
  const zenityBtn = i18next.t(
    'errorManager.errorModalDialog.zenityBtn',
    'Report and Exit'
  )

  if (
    app.isReady() &&
    (
      alertOpts?.hasNoParentWin ||
      isMainWinAvailable(alertOpts?.parentWin ?? wins.mainWindow)
    )
  ) {
    const html = converter.makeHtml(mdIssue)

    const res = await _fireAlert({ html, ...alertOpts })

    return {
      isExit: false,
      isReported: res?.dismiss === 'confirm'
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
      `--ok-label=${zenityBtn}`,
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
