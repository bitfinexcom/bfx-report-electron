'use strict'

const { Notification } = require('electron')
const path = require('path')
const i18next = require('i18next')

const icon = path.join(__dirname, '../../build/icons/64x64.png')

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
  notification.show()

  return notification
}
