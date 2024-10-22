'use strict'

const { app } = require('electron')

const IpcChannelHandlers = require('./ipc.channel.handlers')

class GeneralIpcChannelHandlers extends IpcChannelHandlers {
  async exitHandler (event, args) {
    return app.exit(args?.code ?? 0)
  }
}

module.exports = GeneralIpcChannelHandlers
