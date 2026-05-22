'use strict'

const {
  dialog,
  clipboard,
  BrowserWindow
} = require('electron')
const path = require('node:path')
const i18next = require('i18next')

const getDebugInfo = require('./helpers/get-debug-info')
const openExternalUrl = require('./helpers/open-external-url')

module.exports = () => {
  return async () => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      const {
        detail,
        repositoryUrl,
        productName
      } = getDebugInfo()

      const {
        response: btnId
      } = await dialog.showMessageBox(
        win,
        {
          type: 'info',
          title: productName,
          message: productName,
          detail,
          buttons: [
            i18next.t('showAboutModalDialog.copyButtonText'),
            i18next.t('showAboutModalDialog.gitHubButtonText'),
            i18next.t('common.confirmButtonText')
          ],
          defaultId: 2,
          cancelId: 2,
          icon: path.join(__dirname, '../build/icons/64x64.png')
        }
      )

      if (btnId === 2) {
        return
      }
      if (btnId === 1) {
        await openExternalUrl(repositoryUrl)
      }

      clipboard.writeText(detail)
    } catch (err) {
      console.error(err)
    }
  }
}
