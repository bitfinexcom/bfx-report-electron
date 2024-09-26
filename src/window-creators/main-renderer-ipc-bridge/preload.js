'use strict'

const { contextBridge, ipcRenderer } = require('electron')
const isTestEnv = process.env.NODE_ENV === 'test'

const CHANNEL_NAMES = {
  TRANSLATIONS: 'translations'
}

const INVOKE_METHOD_NAMES = {
  GET_DEFAULT_LANGUAGE: 'getDefaultLanguage',
  GET_AVAILABLE_LANGUAGES: 'getAvailableLanguages'
}

const getEventName = (channel, method) => {
  return `${channel}:${method}`
}

const invoke = (channel, method, args) => {
  const eventName = getEventName(channel, method)

  return ipcRenderer.invoke(eventName, args)
}

const bfxReportElectronApi = {}

for (const methodName of Object.values(INVOKE_METHOD_NAMES)) {
  bfxReportElectronApi[methodName] = (args) => {
    return invoke(CHANNEL_NAMES.TRANSLATIONS, methodName, args)
  }
}

if (isTestEnv) {
  require('wdio-electron-service/preload')
}

contextBridge.exposeInMainWorld(
  'bfxReportElectronApi',
  bfxReportElectronApi
)
