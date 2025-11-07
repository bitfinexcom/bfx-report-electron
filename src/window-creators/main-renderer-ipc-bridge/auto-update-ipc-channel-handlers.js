'use strict'

const IpcChannelHandlers = require('./ipc.channel.handlers')

class AutoUpdateIpcChannelHandlers extends IpcChannelHandlers {
  static channelName = 'autoUpdate'
}

module.exports = AutoUpdateIpcChannelHandlers
