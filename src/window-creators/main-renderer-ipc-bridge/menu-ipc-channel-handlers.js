'use strict'

const { BaseWindow, webContents, Menu } = require('electron')

const IpcChannelHandlers = require('./ipc.channel.handlers')

const isMac = process.platform === 'darwin'

class MenuIpcChannelHandlers extends IpcChannelHandlers {
  static channelName = 'menu'

  #serializeMenu (menu) {
    if (
      isMac ||
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

  async execMenuCmdHandler (event, args) {
    if (!args?.id) {
      return
    }

    const menu = Menu.getApplicationMenu()
    const menuItem = menu.getMenuItemById(args.id)

    const focusedWindow = BaseWindow.getFocusedWindow()
    const focusedWebContents = webContents.getFocusedWebContents()

    return menuItem.click({}, focusedWindow, focusedWebContents)
  }
}

module.exports = MenuIpcChannelHandlers
