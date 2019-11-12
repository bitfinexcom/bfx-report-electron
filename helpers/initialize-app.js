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
const {
  hideLoadingWindow
} = require('./change-loading-win-visibility-state')
const {
  RunningExpressOnPortError,
  IpcMessageError,
  AppInitializationError
} = require('./errors')

const pathToLayouts = path.join(__dirname, 'layouts')
const pathToLayoutAppInitErr = path.join(pathToLayouts, 'app-init-error.html')
const pathToLayoutExprPortReq = path.join(pathToLayouts, 'express-port-required.html')

const _ipcMessToPromise = (ipc) => {
  return new Promise((resolve, reject) => {
    try {
      ipc.once('message', resolve)
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = () => {
  return new Promise((resolve, reject) => {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
    app.on('ready', async () => {
      try {
        await createMainWindow()
        runServer()

        const mess = await _ipcMessToPromise(ipcs.serverIpc)

        if (!mess || typeof mess.state !== 'string') {
          throw new IpcMessageError()
        }
        if (mess.state === 'error:express-port-required') {
          await createErrorWindow(pathToLayoutExprPortReq)
          reject(mess.err || new RunningExpressOnPortError())

          return
        }
        if (mess.state === 'error:app-init') {
          throw mess.err || new AppInitializationError()
        }
        if (mess.state === 'ready:server') {
          if (appStates.isMainWinMaximized) {
            wins.mainWindow.maximize()
          }

          wins.mainWindow.show()
          hideLoadingWindow()

          wins.mainWindow.webContents
            .executeJavaScript(
              `try { \
                document.querySelector(".bp3-button.bp3-intent-success").click() \
              } catch (e) { console.log(e) }`
            )

          return
        }

        throw new AppInitializationError()
      } catch (err) {
        createErrorWindow(pathToLayoutAppInitErr)
          .then(() => reject(err))
          .catch((err) => reject(err))
      }
    })
  })
}
