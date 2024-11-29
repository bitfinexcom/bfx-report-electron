'use strict'

const IpcChannelHandlers = require('./ipc.channel.handlers')
const createMenu = require('../../create-menu')

class MenuIpcChannelHandlers extends IpcChannelHandlers {
  static channelName = 'menu'

  #menuTemplateFactory () {
    if (this.menuTemplate) {
      return this.menuTemplate
    }

    this.menuTemplate = createMenu({
      shouldMenuTemplateBeReturned: true
    })

    return this.menuTemplate
  }

  async getMenuTemplateHandler (event, args) {
    const menuTemplate = createMenu({
      shouldMenuTemplateBeReturned: true
    })

    return menuTemplate
  }
}

module.exports = MenuIpcChannelHandlers
