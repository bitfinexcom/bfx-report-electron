'use strict'

const IpcChannelHandlers = require('./ipc.channel.handlers')
const makeReportFolderAndShowModalIfNoWritePerm = require(
  '../../make-report-folder-and-show-modal-if-no-write-perm'
)

class ReportExportIpcChannelHandlers extends IpcChannelHandlers {
  static channelName = 'reportExport'

  async getReportFolderWritePermHandler (event, args) {
    return await makeReportFolderAndShowModalIfNoWritePerm({
      noModalWindow: true
    })
  }
}

module.exports = ReportExportIpcChannelHandlers
