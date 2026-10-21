'use strict'

const { Notification } = require('electron')
const path = require('node:path')
const i18next = require('i18next')

const wins = require('../window-creators/windows')
const WINDOW_NAMES = require('../window-creators/window.names')
const { showWindow } = require('../helpers/manage-window')

const { rootPath } = require('../helpers/root-path')
const icon = path.join(rootPath, 'build/icons/64x64.png')

module.exports = (params) => {
  if (!Notification.isSupported()) {
    return
  }

  const notification = new Notification({
    title: i18next.t('nativeNotification.defaulTitle'),
    body: i18next.t('nativeNotification.defaultBody'),
    silent: false,
    timeoutType: 'never',
    urgency: 'normal',
    icon,

    ...params
  })

  notification.once('click', () => {
    showWindow(
      wins[WINDOW_NAMES.MAIN_WINDOW],
      { shouldWinBeFocused: true }
    ).catch((err) => { console.debug(err) })
  })

  notification.show()

  return notification
}
