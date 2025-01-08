'use strict'

const isMac = process.platform === 'darwin'

const MENU_ITEM_ACCELERATORS = {
  MAC_HIDE_MENU_ITEM: 'CmdOrCtrl+H',
  MAC_HIDE_OTHERS_MENU_ITEM: 'CmdOrCtrl+Alt+H',
  MAC_PASTE_AND_MATCH_STYLE_MENU_ITEM: 'CmdOrCtrll+Alt+Shift+V',
  MAC_TOGGLE_DEV_TOOLS_MENU_ITEM: 'CmdOrCtrl+Alt+I',
  MAC_TOGGLE_FULL_SCREEN_MENU_ITEM: 'Option+F',

  ABOUT_MENU_ITEM: 'CmdOrCtrl+O',
  QUIT_MENU_ITEM: 'CmdOrCtrl+Q',
  UNDO_MENU_ITEM: 'CmdOrCtrl+Z',
  REDO_MENU_ITEM: 'CmdOrCtrl+Shift+Z',
  CUT_MENU_ITEM: 'CmdOrCtrl+X',
  COPY_MENU_ITEM: 'CmdOrCtrl+C',
  PASTE_MENU_ITEM: 'CmdOrCtrl+V',
  SELECT_ALL_MENU_ITEM: 'CmdOrCtrl+A',
  RELOAD_MENU_ITEM: 'CmdOrCtrl+R',
  FORCE_RELOAD_MENU_ITEM: 'CmdOrCtrl+Shift+R',
  TOGGLE_DEV_TOOLS_MENU_ITEM: 'CmdOrCtrl+Shift+I',
  RESET_ZOOM_MENU_ITEM: 'CmdOrCtrl+0',
  ZOOM_IN_MENU_ITEM: 'CmdOrCtrl++',
  ZOOM_OUT_MENU_ITEM: 'CmdOrCtrl+-',
  TOGGLE_FULL_SCREEN_MENU_ITEM: 'F11',
  MINIMIZE_MENU_ITEM: 'CmdOrCtrl+M',
  CLOSE_MENU_ITEM: 'CmdOrCtrl+W',
  EXPORT_DB_MENU_ITEM: 'CmdOrCtrl+Alt+E',
  IMPORT_DB_MENU_ITEM: 'CmdOrCtrl+Alt+I',
  RESTORE_DB_MENU_ITEM: 'CmdOrCtrl+Alt+R',
  BACKUP_DB_MENU_ITEM: 'CmdOrCtrl+Alt+B',
  REMOVE_DB_MENU_ITEM: 'CmdOrCtrl+Alt+D',
  CLEAR_ALL_DATA_MENU_ITEM: 'CmdOrCtrl+Alt+C',
  REPORT_BUG_MENU_ITEM: 'CmdOrCtrl+B',
  USER_MANUAL_MENU_ITEM: 'CmdOrCtrl+H'
}

const getPlatformShortcut = (shortcut) => {
  if (
    shortcut.includes('CmdOrCtrl') ||
    shortcut.includes('CommandOrControl')
  ) {
    const cmdOrCtrlShortcut = isMac
      ? 'Cmd'
      : 'Ctrl'

    return shortcut
      .replace('CmdOrCtrl', cmdOrCtrlShortcut)
      .replace('CommandOrControl', cmdOrCtrlShortcut)
  }

  return shortcut
}

module.exports = Object.entries(MENU_ITEM_ACCELERATORS)
  .reduce((accum, item) => {
    const [key, val] = item ?? []

    accum[key] = getPlatformShortcut(val)

    return accum
  }, {})
