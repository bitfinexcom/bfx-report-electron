'use strict'

const { contextBridge, ipcRenderer } = require('electron')
const isTestEnv = process.env.NODE_ENV === 'test'

const CHANNEL_NAMES = {
  GENERAL: 'general',
  TRANSLATIONS: 'translations'
}

const GENERAL_INVOKE_METHOD_NAMES = {
  EXIT: 'exit'
}
const TRANSLATIONS_INVOKE_METHOD_NAMES = {
  SET_LANGUAGE: 'setLanguage',
  GET_LANGUAGE: 'getLanguage',
  GET_AVAILABLE_LANGUAGES: 'getAvailableLanguages',
  TRANSLATE: 'translate'
}

const CHANNEL_MAP = new Map([
  [CHANNEL_NAMES.GENERAL, GENERAL_INVOKE_METHOD_NAMES],
  [CHANNEL_NAMES.TRANSLATIONS, TRANSLATIONS_INVOKE_METHOD_NAMES]
])

const getEventName = (channel, method) => {
  return `${channel}:${method}`
}

const invoke = (channel, method, args) => {
  const eventName = getEventName(channel, method)

  return ipcRenderer.invoke(eventName, args)
}

const bfxReportElectronApi = {}

for (const [channelName, invokeMethodNames] of CHANNEL_MAP) {
  for (const methodName of Object.values(invokeMethodNames)) {
    bfxReportElectronApi[methodName] = (args) => {
      return invoke(channelName, methodName, args)
    }
  }
}

if (isTestEnv) {
  require('wdio-electron-service/preload')
}

contextBridge.exposeInMainWorld(
  'bfxReportElectronApi',
  bfxReportElectronApi
)
