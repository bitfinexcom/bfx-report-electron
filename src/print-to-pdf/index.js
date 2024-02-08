'use strict'

const { BrowserWindow } = require('electron')

const ipcs = require('../ipcs')
const wins = require('../windows')

const PROCESS_MESSAGES = require(
  '../../bfx-reports-framework/workers/loc.api/process.message.manager/process.messages'
)
const PROCESS_STATES = require(
  '../../bfx-reports-framework/workers/loc.api/process.message.manager/process.states'
)

module.exports = () => {
  ipcs.serverIpc.on('message', async (mess) => {
    try {
      if (mess?.state !== PROCESS_MESSAGES.CREATE_PDF) {
        return
      }

      const {
        template = 'No data',
        format = 'portrait',
        orientation = 'Letter',
        uid = null
      } = mess?.data ?? {}

      const win = new BrowserWindow({
        show: false,
        parent: wins.mainWindow,
        webPreferences: {
          nodeIntegration: true
        }
      })
      win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(template)}`)

      await new Promise((resolve, reject) => {
        win.webContents.on('did-finish-load', resolve)
        win.webContents.on('did-fail-load', (e, code, err) => {
          reject(err)
        })
      })
      const buffer = await win.webContents.printToPDF({
        landscape: format !== 'portrait',
        pageSize: orientation,
        margins: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        },
        displayHeaderFooter: true,
        footerTemplate: `\
<span style="
    position: absolute;
    right: 10px;
    bottom: 10px;
    font-weight: 400;
    font-size: 8px;
  ">
  Page <span class=pageNumber></span> from <span class=totalPages></span>
</span>`
      })

      ipcs.serverIpc.send({
        state: PROCESS_STATES.CREATED_PDF_BUFFER,
        data: { buffer, uid }
      })
    } catch (error) {
      ipcs.serverIpc.send({
        state: PROCESS_STATES.ERROR_PDF_CREATION,
        data: { error, uid: mess?.data?.uid ?? null }
      })

      console.error(error)
    }
  })
}
