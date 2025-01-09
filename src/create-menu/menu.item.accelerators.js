'use strict'

const isMac = process.platform === 'darwin'

const CONJUCTION_CHARACTER = '+'
const KEY_MODIFIERS = {
  CMD_OR_CTRL: 'CmdOrCtrl',
  COMMAND_OR_CONTROL: 'CommandOrControl',
  CMD: 'Cmd',
  CTRL: 'Ctrl',
  ALT: 'Alt',
  SHIFT: 'Shift',
  OPTION: 'Option'
}
const KEY_CODES = {
  H: 'H',
  V: 'V',
  I: 'I',
  F: 'F',
  O: 'O',
  Q: 'Q',
  Z: 'Z',
  X: 'X',
  C: 'C',
  A: 'A',
  R: 'R',
  ZERO: '0',
  PLUS: '+',
  MINUS: '-',
  F11: 'F11',
  M: 'M',
  W: 'W',
  E: 'E',
  B: 'B',
  D: 'D'
}

const constructAccelerator = (...keys) => {
  if (keys.length === 0) {
    return ''
  }

  return keys.join(CONJUCTION_CHARACTER)
}

const MENU_ITEM_ACCELERATORS = {
  MAC_HIDE_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.H
  ),
  MAC_HIDE_OTHERS_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_MODIFIERS.ALT,
    KEY_CODES.H
  ),
  MAC_PASTE_AND_MATCH_STYLE_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_MODIFIERS.ALT,
    KEY_MODIFIERS.SHIFT,
    KEY_CODES.V
  ),
  MAC_TOGGLE_DEV_TOOLS_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_MODIFIERS.ALT,
    KEY_CODES.I
  ),
  MAC_TOGGLE_FULL_SCREEN_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.OPTION,
    KEY_CODES.F
  ),
  MAC_USER_MANUAL_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.OPTION,
    KEY_CODES.H
  ),

  ABOUT_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.O
  ),
  QUIT_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.Q
  ),
  UNDO_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.Z
  ),
  REDO_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_MODIFIERS.SHIFT,
    KEY_CODES.Z
  ),
  CUT_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.X
  ),
  COPY_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.C
  ),
  PASTE_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.V
  ),
  SELECT_ALL_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.A
  ),
  RELOAD_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.R
  ),
  FORCE_RELOAD_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_MODIFIERS.SHIFT,
    KEY_CODES.R
  ),
  TOGGLE_DEV_TOOLS_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_MODIFIERS.SHIFT,
    KEY_CODES.I
  ),
  RESET_ZOOM_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.ZERO
  ),
  ZOOM_IN_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.PLUS
  ),
  ZOOM_OUT_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.MINUS
  ),
  TOGGLE_FULL_SCREEN_MENU_ITEM: constructAccelerator(
    KEY_CODES.F11
  ),
  MINIMIZE_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.M
  ),
  CLOSE_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.W
  ),
  EXPORT_DB_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_MODIFIERS.ALT,
    KEY_CODES.E
  ),
  IMPORT_DB_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_MODIFIERS.ALT,
    KEY_MODIFIERS.SHIFT,
    KEY_CODES.I
  ),
  RESTORE_DB_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_MODIFIERS.ALT,
    KEY_CODES.R
  ),
  BACKUP_DB_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_MODIFIERS.ALT,
    KEY_CODES.B
  ),
  REMOVE_DB_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_MODIFIERS.ALT,
    KEY_CODES.D
  ),
  CLEAR_ALL_DATA_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_MODIFIERS.ALT,
    KEY_CODES.C
  ),
  REPORT_BUG_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.B
  ),
  USER_MANUAL_MENU_ITEM: constructAccelerator(
    KEY_MODIFIERS.CMD_OR_CTRL,
    KEY_CODES.H
  )
}

const getPlatformShortcut = (shortcut) => {
  if (
    shortcut.includes(KEY_MODIFIERS.CMD_OR_CTRL) ||
    shortcut.includes(KEY_MODIFIERS.COMMAND_OR_CONTROL)
  ) {
    const cmdOrCtrlShortcut = isMac
      ? KEY_MODIFIERS.CMD
      : KEY_MODIFIERS.CTRL

    return shortcut
      .replace(KEY_MODIFIERS.CMD_OR_CTRL, cmdOrCtrlShortcut)
      .replace(KEY_MODIFIERS.COMMAND_OR_CONTROL, cmdOrCtrlShortcut)
  }

  return shortcut
}

module.exports = Object.entries(MENU_ITEM_ACCELERATORS)
  .reduce((accum, item) => {
    const [key, val] = item ?? []

    accum[key] = getPlatformShortcut(val)

    return accum
  }, {})
