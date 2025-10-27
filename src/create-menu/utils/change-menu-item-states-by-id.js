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
  const args = Array.isArray(menuItemId)
    ? menuItemId
    : [{ menuItemId, opts }]

  if (
    !(menu instanceof Menu) ||
    args.length === 0
  ) {
    return
  }

  for (const item of args) {
    const id = item?.menuItemId
    const props = {
      ...item?.opts,
      ...opts
    }

    if (!id) {
      continue
    }

    const menuItem = id instanceof MenuItem
      ? id
      : menu.getMenuItemById(id)

    for (const [name, val] of Object.entries(props)) {
      menuItem[name] = val
    }
  }

  if (!isMainWinAvailable()) {
    return
  }

  MenuIpcChannelHandlers
    .sendRerenderMenuEvent(wins[WINDOW_NAMES.MAIN_WINDOW])
}
