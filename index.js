'use strict'

const electron = require('electron')
const path = require('path')
const url = require('url')
const { fork } = require('child_process')

const { app, BrowserWindow, Menu } = electron

const isDevEnv = process.env.NODE_ENV === 'development'

let mainWindow = null
let parrentWindow = null

const pathToLayouts = path.join(__dirname, 'layouts')
const pathToLayoutAppInit = path.join(pathToLayouts, 'app-init.html')
const pathToLayoutAppInitErr = path.join(pathToLayouts, 'app-init-error.html')
const pathToLayoutExprPortReq = path.join(pathToLayouts, 'express-port-required.html')

const serverPath = path.join(__dirname, 'server.js')
let ipc = null

const runServer = () => {
  ipc = fork(serverPath, [], {
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
  pathname = path.join(__dirname, '/bfx-report-ui/build/index.html'),
  props = {}
) => {
  const _props = {
    autoHideMenuBar: true,
    width: 1000,
    height: 650,
    minWidth: 1000,
    minHeight: 650,
    icon: path.join(__dirname, 'build/icons/512.png'),
    backgroundColor: '#394b59',
    show: false,
    ...props
  }

  const window = new BrowserWindow(_props)

  const startUrl = url.format({
    pathname,
    protocol: 'file:',
    slashes: true
  })

  window.loadURL(startUrl)

  window.on('close', () => {
    if (ipc) ipc.kill('SIGINT')
  })
  window.once('ready-to-show', () => {
    window.maximize()
    window.show()
  })

  return window
}

const createParrentWindow = () => {
  parrentWindow = createWindow(pathToLayoutAppInit)

  parrentWindow.on('closed', () => {
    parrentWindow = null
  })

  createMenu()
}

const createMainWindow = (pathname) => {
  mainWindow = createWindow(
    pathname,
    {
      parent: parrentWindow,
      modal: true
    }
  )

  if (isDevEnv) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null

    parrentWindow.close()
    parrentWindow = null
  })
  mainWindow.once('ready-to-show', () => {
    parrentWindow.hide()
  })
}

app.on('ready', () => {
  createParrentWindow()

  try {
    runServer()
  } catch (err) {
    createMainWindow(pathToLayoutAppInitErr)

    return
  }

  ipc.once('message', mess => {
    if (!mess || typeof mess.state !== 'string') {
      createMainWindow(pathToLayoutAppInitErr)

      return
    }

    switch (mess.state) {
      case 'ready:server':
        createMainWindow()
        break

      case 'error:express-port-required':
        createMainWindow(pathToLayoutExprPortReq)
        break

      case 'error:app-init':
        createMainWindow(pathToLayoutAppInitErr)
        break
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
