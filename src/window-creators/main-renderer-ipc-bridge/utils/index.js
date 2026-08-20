'use strict'

const mainRendererIpcBridge = require('..')

let isInited = false

const initIpcChannelHandlers = () => {
  if (isInited) {
    return mainRendererIpcBridge
  }

  const IpcChannelHandlersList = Object.values(mainRendererIpcBridge)

  for (const IpcChannelHandlers of IpcChannelHandlersList) {
    IpcChannelHandlers.create()
  }

  isInited = true

  return mainRendererIpcBridge
}

module.exports = {
  initIpcChannelHandlers
}
