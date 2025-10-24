'use strict'

const { Menu, MenuItem } = require('electron')

const MenuIpcChannelHandlers = require(
  '../../window-creators/main-renderer-ipc-bridge/menu-ipc-channel-handlers'
)
const wins = require('../../window-creators/windows')
const WINDOW_NAMES = require('../../window-creators/window.names')
const isMainWinAvailable = require(
  '../../helpers/is-main-win-available'
)

module.exports = (menuItemId, opts) => {
  const menu = Menu.getApplicationMenu()

  if (
    !(menu instanceof Menu) ||
    !menuItemId
  ) {
    return
  }

  const menuItem = menuItemId instanceof MenuItem
    ? menuItemId
    : menu.getMenuItemById(menuItemId)

  for (const [name, val] of Object.entries(opts ?? {})) {
    menuItem[name] = val
  }

  if (!isMainWinAvailable()) {
    return
  }

  MenuIpcChannelHandlers
    .sendRerenderMenuEvent(wins[WINDOW_NAMES.MAIN_WINDOW])
}
