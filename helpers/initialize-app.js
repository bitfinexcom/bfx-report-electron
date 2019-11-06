'use strict'

const electron = require('electron')
const path = require('path')

const { app } = electron

const wins = require('./windows')
const ipcs = require('./ipcs')
const runServer = require('./run-server')
const appStates = require('./app-states')
const {
  createMainWindow,
  createErrorWindow
} = require('./window-creators')

const pathToLayouts = path.join(__dirname, 'layouts')
const pathToLayoutAppInitErr = path.join(pathToLayouts, 'app-init-error.html')
const pathToLayoutExprPortReq = path.join(pathToLayouts, 'express-port-required.html')

module.exports = () => {
  app.on('ready', () => {
    createMainWindow(() => {
      try {
        runServer()
      } catch (err) {
        console.error(err)
        createErrorWindow(pathToLayoutAppInitErr)

        return
      }

      ipcs.serverIpc.once('message', async (mess) => {
        if (!mess || typeof mess.state !== 'string') {
          console.error(new Error('ERR_IPC_MESSAGE'))
          createErrorWindow(pathToLayoutAppInitErr)

          return
        }

        switch (mess.state) {
          case 'ready:server':
            if (appStates.isMainWinMaximized) {
              wins.mainWindow.maximize()
            }

            wins.mainWindow.show()

            if (wins.loadingWindow) {
              wins.loadingWindow.hide()
            }

            wins.mainWindow.webContents
              .executeJavaScript(
                'try { document.querySelector(".bp3-button.bp3-intent-success").click() } catch (e) { console.log(e) }'
              )
            break

          case 'error:express-port-required':
            createErrorWindow(pathToLayoutExprPortReq)
            break

          case 'error:app-init':
            createErrorWindow(pathToLayoutAppInitErr)
            break
        }
      })
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}
