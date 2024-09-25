'use strict'

const { ipcRenderer, contextBridge } = require('electron')

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const isTest = process.env.NODE_ENV === 'test'

if (isTest) {
  require('wdio-electron-service/preload')
}

contextBridge.exposeInMainWorld('electron', {
  openDialog: (method, config) => ipcRenderer
    .send('dialog', method, config)
})
