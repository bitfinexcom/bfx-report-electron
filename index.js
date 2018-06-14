'use strict'

const electron = require('electron')
const path = require('path')
const url = require('url')
const { fork } = require('child_process')

const { app, BrowserWindow } = electron

let mainWindow

const serverPath = path.join(__dirname, 'server.js')
let ipc = null

const runServer = () => {
  ipc = fork(serverPath, [], {
    cwd: process.cwd(),
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  })
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 800,
    height: 600
  })

  const startUrl = url.format({
    pathname: path.join(__dirname, '/bfx-report-ui/build/index.html'),
    protocol: 'file:',
    slashes: true
  })

  mainWindow.loadURL(startUrl)

  // TODO:
  // mainWindow.webContents.openDevTools()

  mainWindow.on('close', () => {
    ipc.kill('SIGINT')
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
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
