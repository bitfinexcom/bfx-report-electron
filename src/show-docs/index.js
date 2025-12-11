'use strict'

const { app } = require('electron')
const { Converter } = require('showdown')
const i18next = require('i18next')

const {
  createModalWindow
} = require('../window-creators')
const isMainWinAvailable = require(
  '../helpers/is-main-win-available'
)
const { UserManualShowingError } = require('../errors')

const converter = new Converter({
  tables: true,
  strikethrough: true,
  tasklists: true,
  disableForced4SpacesIndentedSublists: true,
  requireSpaceBeforeHeadingText: true
})

const _fireAlert = async (params) => {
  const {
    title = i18next.t('showDocs.modalDialog.title'),
    html = '',
    showConfirmButton = false,
    showWinCloseButton = false,
    confirmButtonText = i18next.t('common.confirmButtonText')
  } = params ?? {}

  const res = await createModalWindow(
    {
      icon: 'info',
      title,
      text: html,
      textClassName: 'markdown-body',
      showConfirmButton,
      confirmButtonText,
      showCancelButton: true,
      showWinCloseButton,
      cancelButtonText: i18next
        .t('showDocs.modalDialog.cancelButtonText')
    },
    {
      width: 1000,
      height: 600,
      shouldWinBeClosedIfClickingOutside: true
    })

  return res?.modalRes ?? {}
}

module.exports = async (params) => {
  try {
    const {
      icon,
      title,
      mdDoc = i18next.t('mdDocs:userManual'),
      showConfirmButton,
      confirmButtonText,
      showWinCloseButton
    } = params ?? {}

    if (
      !app.isReady() ||
      !isMainWinAvailable()
    ) {
      throw new UserManualShowingError()
    }

    const html = converter.makeHtml(mdDoc)

    return await _fireAlert({
      icon,
      title,
      html,
      showConfirmButton,
      confirmButtonText,
      showWinCloseButton
    })
  } catch (err) {
    console.error(err)
  }
}
