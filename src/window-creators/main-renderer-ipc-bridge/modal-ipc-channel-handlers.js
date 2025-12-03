'use strict'

const { screen } = require('electron')

const IpcChannelHandlers = require('./ipc.channel.handlers')
const { initClosedEventListener } = require('./helpers')

const wins = require('../windows')
const WINDOW_NAMES = require('../window.names')

class ModalIpcChannelHandlers extends IpcChannelHandlers {
  static channelName = 'modal'

  static isModalClosedEventListenerInited = false
  static modalClosedEventHandlerSet = new Set()
  static isModalReadyToBeShownControlObj = {
    promise: Promise.resolve(),
    resolve: () => {}
  }

  static onModalClosedEvent (cb) {
    return this.handleListener(this.onModalClosedEvent, cb)
  }

  static async sendFireModalEvent (win, args) {
    this.isModalReadyToBeShownControlObj
      .promise = new Promise((resolve) => {
        this.isModalReadyToBeShownControlObj.resolve = () => {
          this.isModalReadyToBeShownControlObj.resolve = () => {}
          resolve()
        }
      })

    const {
      closedEventPromise,
      toastId
    } = initClosedEventListener({
      handlerSet: this.modalClosedEventHandlerSet,
      setInitFlagFn: (flag) => {
        this.isModalClosedEventListenerInited = flag
      },
      getInitFlagFn: () => this.isModalClosedEventListenerInited,
      onClosedEventFn: (cb) => {
        this.onModalClosedEvent(cb)
      }
    })

    this.sendToRenderer(this.sendFireModalEvent, win, {
      ...args,
      toastId
    })

    return await closedEventPromise
  }

  setWindowHeightHandler (event, args) {
    const win = wins[WINDOW_NAMES.MODAL_WINDOW]
    const height = args?.height

    if (
      !win ||
      !Number.isInteger(height)
    ) {
      return
    }

    const point = screen.getCursorScreenPoint()
    const { workArea } = screen.getDisplayNearestPoint(point)
    const { height: screenHeight } = workArea
    const maxHeight = Math.floor(screenHeight * 0.90)

    win.setBounds({ height: Math.min(height, maxHeight) }, true)
    win.center()
    this.constructor.isModalReadyToBeShownControlObj.resolve()
  }
}

module.exports = ModalIpcChannelHandlers
