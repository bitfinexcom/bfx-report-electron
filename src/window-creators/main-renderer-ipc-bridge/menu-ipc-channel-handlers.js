'use strict'

const { Menu } = require('electron')

const IpcChannelHandlers = require('./ipc.channel.handlers')

class MenuIpcChannelHandlers extends IpcChannelHandlers {
  static channelName = 'menu'

  #serializeMenu (menu) {
    if (
      !Array.isArray(menu?.items) ||
      menu.items.length === 0
    ) {
      return []
    }

    const serializedMenu = []

    for (const [i, menuItem] of menu.items.entries()) {
      const {
        label,
        id,
        type,
        accelerator,
        enabled,
        visible,
        checked,
        submenu
      } = menuItem ?? {}

      const serializedMenuItem = {
        label,
        id,
        type,
        accelerator,
        enabled,
        visible,
        checked: typeof checked === 'function'
          ? checked()
          : checked,
        submenu: this.#serializeMenu(submenu)
      }
      const hasSubmenu = (
        Array.isArray(serializedMenuItem.submenu) &&
        serializedMenuItem.submenu.length > 0
      )
      const isSeparator = (
        type === 'separator' &&
        serializedMenu[i - 1]?.type &&
        serializedMenu[i - 1]?.type !== 'separator'
      )

      if (!hasSubmenu) {
        serializedMenuItem.submenu = null
      }
      if (isSeparator) {
        serializedMenu.push(serializedMenuItem)

        continue
      }
      if (
        !id &&
        !hasSubmenu
      ) {
        continue
      }

      serializedMenu.push(serializedMenuItem)
    }

    return serializedMenu
  }

  async getMenuTemplateHandler (event, args) {
    const menu = Menu.getApplicationMenu()
    const serializedMenu = this.#serializeMenu(menu)

    return serializedMenu
  }
}

module.exports = MenuIpcChannelHandlers
