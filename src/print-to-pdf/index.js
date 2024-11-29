'use strict'

const { BrowserWindow } = require('electron')
const fs = require('fs/promises')
const path = require('path')
const i18next = require('i18next')

const ipcs = require('../ipcs')
const wins = require('../window-creators/windows')

const PROCESS_MESSAGES = require(
  '../../bfx-reports-framework/workers/loc.api/process.message.manager/process.messages'
)
const PROCESS_STATES = require(
  '../../bfx-reports-framework/workers/loc.api/process.message.manager/process.states'
)

module.exports = () => {
  ipcs.serverIpc.on('message', async (mess) => {
    let templateFilePathForRm = null

    try {
      if (mess?.state !== PROCESS_MESSAGES.REQUEST_PDF_CREATION) {
        return
      }

      const {
        templateFilePath,
        template = i18next.t('printToPDF.defaultTemplate'),
        format = 'portrait',
        orientation = 'Letter',
        uid = null
      } = mess?.data ?? {}

      const isTemplateFilePathUsed = (
        templateFilePath &&
        typeof templateFilePath === 'string'
      )
      templateFilePathForRm = isTemplateFilePathUsed
        ? templateFilePath
        : null

      const win = new BrowserWindow({
        show: false,
        parent: wins.mainWindow,
        webPreferences: {
          nodeIntegration: true
        }
      })
      const closedEventPromise = new Promise((resolve) => (
        win.once('closed', resolve)
      ))
      const loadPromise = isTemplateFilePathUsed
        ? win.loadFile(templateFilePath)
        : win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(template)}`)

      await loadPromise

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
  ${i18next.t('printToPDF.pagination.page')} <span class=pageNumber></span> ${i18next.t('printToPDF.pagination.from')} <span class=totalPages></span>
</span>`
      })

      win.close()
      await closedEventPromise

      if (isTemplateFilePathUsed) {
        await fs.rm(templateFilePath, { force: true, maxRetries: 3 })

        const { dir, name } = path.parse(templateFilePath)
        const pdfFilePath = path.format({ dir, name, ext: '.pdf' })

        await fs.writeFile(pdfFilePath, buffer)

        ipcs.serverIpc.send({
          state: PROCESS_STATES.RESPONSE_PDF_CREATION,
          data: { pdfFilePath, uid }
        })

        return
      }

      ipcs.serverIpc.send({
        state: PROCESS_STATES.RESPONSE_PDF_CREATION,
        data: { buffer, uid }
      })
    } catch (err) {
      if (templateFilePathForRm) {
        fs.rm(templateFilePathForRm, { force: true, maxRetries: 3 })
          .then(() => {}, (err) => { console.debug(err) })
      }

      ipcs.serverIpc.send({
        state: PROCESS_STATES.RESPONSE_PDF_CREATION,
        data: { err: err.stack ?? err, uid: mess?.data?.uid ?? null }
      })

      console.error(err)
    }
  })
}
