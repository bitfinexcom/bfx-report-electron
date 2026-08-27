'use strict'

const TranslationIpcChannelHandlers = require(
  './translation-ipc-channel-handlers'
)
const GeneralIpcChannelHandlers = require(
  './general-ipc-channel-handlers'
)
const MenuIpcChannelHandlers = require(
  './menu-ipc-channel-handlers'
)
const ThemeIpcChannelHandlers = require(
  './theme-ipc-channel-handlers'
)
const AutoUpdateIpcChannelHandlers = require(
  './auto-update-ipc-channel-handlers'
)
const ModalIpcChannelHandlers = require(
  './modal-ipc-channel-handlers'
)
const ReportExportIpcChannelHandlers = require(
  './report-export-ipc-channel-handlers'
)

module.exports = {
  GeneralIpcChannelHandlers,
  TranslationIpcChannelHandlers,
  MenuIpcChannelHandlers,
  ThemeIpcChannelHandlers,
  AutoUpdateIpcChannelHandlers,
  ModalIpcChannelHandlers,
  ReportExportIpcChannelHandlers
}
