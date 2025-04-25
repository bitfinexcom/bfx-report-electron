'use strict'

const { app, dialog } = require('electron')
const i18next = require('i18next')

const productName = require('./helpers/product-name')
const {
  showLoadingWindow,
  hideLoadingWindow
} = require('./window-creators/change-loading-win-visibility-state')
const WINDOW_NAMES = require('./window-creators/window.names')

module.exports = async () => {
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'development' ||
    process.platform !== 'darwin'
  ) {
    return
  }
  if (app.isInApplicationsFolder()) {
    return
  }

  const clickedButtonIndex = dialog.showMessageBoxSync({
    type: 'error',
    message: i18next
      .t('enforceMacOSAppLocation.appLocationModalDialog.message'),
    detail: i18next.t(
      'enforceMacOSAppLocation.appLocationModalDialog.detail',
      { productName }
    ),
    buttons: [
      i18next.t('enforceMacOSAppLocation.appLocationModalDialog.confirmButtonText'),
      i18next.t(
        'enforceMacOSAppLocation.appLocationModalDialog.cancelButtonText',
        { productName }
      )
    ],
    defaultId: 0,
    cancelId: 1
  })

  if (clickedButtonIndex === 1) {
    app.quit()

    return
  }

  await showLoadingWindow({
    windowName: WINDOW_NAMES.STARTUP_LOADING_WINDOW,
    description: i18next
      .t('enforceMacOSAppLocation.loadingWindow.description'),
    isRequiredToCloseAllWins: true,
    isIndeterminateMode: true,
    shouldCloseBtnBeShown: true,
    shouldMinimizeBtnBeShown: true
  })

  app.moveToApplicationsFolder({
    conflictHandler: (conflict) => {
      if (conflict === 'existsAndRunning') {
        dialog.showMessageBoxSync({
          type: 'error',
          message: i18next.t(
            'enforceMacOSAppLocation.appRunningModalDialog.message',
            { productName }
          ),
          buttons: [
            i18next.t('common.confirmButtonText')
          ]
        })

        app.quit()
      }

      return true
    }
  })

  await hideLoadingWindow()
}
