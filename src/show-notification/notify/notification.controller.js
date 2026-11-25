'use strict'

const { setTimeout } = require('node:timers/promises')

const notificationControllerList = []

class NotificationController {
  #delayMs = 1500
  #notification = null
  #nextController = null

  constructor (notification) {
    this.#notification = notification

    this.#registerController()
    this.run()
  }

  #registerController () {
    const lastIndex = notificationControllerList.length - 1
    const lastController = notificationControllerList[lastIndex]

    notificationControllerList.push(this)
    lastController?.setNextController(this)
  }

  #shiftController () {
    try {
      notificationControllerList.shift()
      this.#nextController?.run()
      this.#nextController = null
      this.#notification = null
    } catch (err) {
      console.debug(err)
    }
  }

  #isThisNotFirstCtrl () {
    return notificationControllerList[0] !== this
  }

  setNextController (controller) {
    this.#nextController = controller
  }

  async run () {
    try {
      if (this.#isThisNotFirstCtrl()) {
        return
      }

      this.#notification?.show()
      await setTimeout(this.#delayMs, null, { ref: false })
      this.#shiftController()
    } catch (err) {
      this.#shiftController()
      console.debug(err)
    }
  }
}

module.exports = NotificationController
