'use strict'

const { shell } = require('electron')
const fs = require('node:fs/promises')

const IpcChannelHandlers = require('./ipc.channel.handlers')
const makeReportFolderAndShowModalIfNoWritePerm = require(
  '../../make-report-folder-and-show-modal-if-no-write-perm'
)

class ReportExportIpcChannelHandlers extends IpcChannelHandlers {
  static channelName = 'reportExport'

  async showItemInFolderHandler (event, args) {
    const { fullPath } = args ?? {}

    if (
      !fullPath ||
      typeof fullPath !== 'string'
    ) {
      return false
    }

    const stat = await fs.stat(fullPath)

    if (stat.isFile()) {
      shell.showItemInFolder(fullPath)

      return true
    }
    if (stat.isDirectory()) {
      await shell.openPath(fullPath)

      return true
    }

    return false
  }

  async getReportFolderWritePermHandler (event, args) {
    return await makeReportFolderAndShowModalIfNoWritePerm({
      noModalWindow: true
    })
  }
}

module.exports = ReportExportIpcChannelHandlers
