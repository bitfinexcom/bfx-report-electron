'use strict'

const electron = require('electron')
const path = require('path')
const url = require('url')
const { fork } = require('child_process')

const { app, BrowserWindow, Menu } = electron

let mainWindow

const serverPath = path.join(__dirname, 'server.js')
let ipc = null

const runServer = () => {
  ipc = fork(serverPath, [], {
    cwd: process.cwd(),
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  })
}

const createMenu = () => {
  const menuTemplate = [
    {
      label: 'Application',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click () {
            app.quit()
          }
        }
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
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:'
        }
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1000,
    height: 650,
    minWidth: 1000,
    minHeight: 650,
    icon: path.join(__dirname, 'build/icons/512.png')
  })

  const startUrl = url.format({
    pathname: path.join(__dirname, '/bfx-report-ui/build/index.html'),
    protocol: 'file:',
    slashes: true
  })

  mainWindow.loadURL(startUrl)

  mainWindow.on('close', () => {
    ipc.kill('SIGINT')
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  createMenu()
}

app.on('ready', () => {
  runServer()

  ipc.on('message', mess => {
    if (mess && mess.state === 'ready:server') {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
