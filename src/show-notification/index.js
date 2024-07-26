'use strict'

const { Notification } = require('electron')
const path = require('path')

const icon = path.join(__dirname, '../../build/icons/64x64.png')

module.exports = (params) => {
  if (!Notification.isSupported()) {
    return
  }

  const notification = new Notification({
    title: 'Bitfinex Report',
    body: 'Notification',
    silent: false,
    timeoutType: 'never',
    urgency: 'normal',
    icon,

    ...params
  })
  notification.show()

  return notification
}
