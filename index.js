'use strict'

const electron = require('electron')
const path = require('path')
const url = require('url')
const { fork } = require('child_process')
const serve = require('electron-serve')
const windowStateKeeper = require('./helpers/electron-window-state')

const { app, BrowserWindow, Menu } = electron

const isDevEnv = process.env.NODE_ENV === 'development'
const env = {
  ...process.env,
  ELECTRON_VERSION: process.versions.electron
}

const wins = {
  mainWindow: null,
  loadingWindow: null,
  errorWindow: null
}

const publicDir = path.join(__dirname, 'bfx-report-ui/build')
const loadURL = serve({ directory: publicDir })

const pathToLayouts = path.join(__dirname, 'layouts')
const pathToLayoutAppInit = path.join(pathToLayouts, 'app-init.html')
const pathToLayoutAppInitErr = path.join(pathToLayouts, 'app-init-error.html')
const pathToLayoutExprPortReq = path.join(pathToLayouts, 'express-port-required.html')

const serverPath = path.join(__dirname, 'server.js')
let ipc = null
let isMainWinMaximized = false

const runServer = () => {
  ipc = fork(serverPath, [], {
    env,
    cwd: process.cwd(),
    silent: false
  })
}

const createMenu = () => {
  const menuTemplate = [
    {
      label: 'Application',
      submenu: [
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
}

const createWindow = (
  cb,
  pathname = null,
  winName = 'mainWindow',
  props = {}
) => {
  const point = electron.screen.getCursorScreenPoint()
  const { bounds, workAreaSize } = electron.screen.getDisplayNearestPoint(point)
  const {
    width: defaultWidth,
    height: defaultHeight
  } = workAreaSize
  const isMainWindow = winName === 'mainWindow'
  const {
    width = defaultWidth,
    height = defaultHeight,
    x,
    y,
    isMaximized,
    manage
  } = isMainWindow
    ? windowStateKeeper({
      defaultWidth,
      defaultHeight
    })
    : {}
  const _props = {
    autoHideMenuBar: true,
    width,
    height,
    minWidth: 1000,
    minHeight: 650,
    x: !x
      ? bounds.x
      : x,
    y: !y
      ? bounds.y
      : y,
    icon: path.join(__dirname, 'build/icons/512.png'),
    backgroundColor: '#394b59',
    show: false,
    ...props
  }

  wins[winName] = new BrowserWindow(_props)

  const startUrl = pathname
    ? url.format({
      pathname,
      protocol: 'file:',
      slashes: true
    })
    : 'app://-'

  if (!pathname) {
    loadURL(wins[winName])
  }

  wins[winName].loadURL(startUrl)

  wins[winName].on('close', () => {
    wins[winName] = null

    if (ipc) ipc.kill('SIGINT')
  })

  wins[winName].once('ready-to-show', () => {
    if (!pathname) {
      createLoadingWindow(cb)

      return
    }

    wins[winName].show()

    if (typeof cb === 'function') {
      cb()
    }
  })

  if (isMainWindow) {
    isMainWinMaximized = isMaximized

    manage(wins[winName])
  }
}

const createMainWindow = (cb) => {
  createWindow(cb)

  if (isDevEnv) {
    wins.mainWindow.webContents.openDevTools()
  }

  createMenu()
}

const createChildWindow = (
  pathname,
  winName,
  cb,
  {
    width = 500,
    height = 500,
    frame = false
  } = {}
) => {
  const point = electron.screen.getCursorScreenPoint()
  const { bounds } = electron.screen.getDisplayNearestPoint(point)
  const x = Math.ceil(bounds.x + ((bounds.width - width) / 2))
  const y = Math.ceil(bounds.y + ((bounds.height - height) / 2))

  createWindow(
    cb,
    pathname,
    winName,
    {
      width,
      height,
      minWidth: width,
      minHeight: height,
      x,
      y,
      resizable: false,
      center: true,
      parent: wins.mainWindow,
      frame
    }
  )

  wins[winName].on('closed', () => {
    if (wins.mainWindow) {
      wins.mainWindow.close()
    }

    wins.mainWindow = null
  })
}

const createLoadingWindow = (cb) => {
  createChildWindow(
    pathToLayoutAppInit,
    'loadingWindow',
    cb
  )
}

const createErrorWindow = (pathname) => {
  createChildWindow(
    pathname,
    'errorWindow',
    () => {
      if (wins.loadingWindow) {
        wins.loadingWindow.hide()
      }
    },
    {
      height: 200,
      frame: true
    }
  )
}

const shouldQuit = app.makeSingleInstance(() => {
  if (wins.mainWindow) {
    if (wins.mainWindow.isMinimized()) {
      wins.mainWindow.restore()
    }

    wins.mainWindow.focus()
  }
})

const initialize = () => {
  app.on('ready', () => {
    createMainWindow(() => {
      try {
        runServer()
      } catch (err) {
        createErrorWindow(pathToLayoutAppInitErr)

        return
      }

      ipc.once('message', async (mess) => {
        if (!mess || typeof mess.state !== 'string') {
          createErrorWindow(pathToLayoutAppInitErr)

          return
        }

        switch (mess.state) {
          case 'ready:server':
            if (isMainWinMaximized) {
              wins.mainWindow.maximize()
            }

            wins.mainWindow.show()

            if (wins.loadingWindow) {
              wins.loadingWindow.hide()
            }
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

if (shouldQuit) {
  app.quit()
} else {
  initialize()
}
