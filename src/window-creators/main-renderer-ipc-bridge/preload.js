'use strict'

const { contextBridge, ipcRenderer } = require('electron')
const isTestEnv = process.env.NODE_ENV === 'test'

const CHANNEL_NAMES = {
  GENERAL: 'general',
  TRANSLATIONS: 'translations',
  MENU: 'menu',
  THEME: 'theme'
}

const GENERAL_INVOKE_METHOD_NAMES = {
  EXIT: 'exit',
  HIDE_LOADING_WINDOW: 'hideLoadingWindow',
  GET_TITLE: 'getTitle'
}
const GENERAL_EVENT_METHOD_NAMES = {
  ON_LOADING_DESCRIPTION: 'onLoadingDescription',
  ON_LOADING_BTN_STATES: 'onLoadingBtnStates',
  SEND_LOADING_DESCRIPTION_READY: 'sendLoadingDescriptionReady'
}
const TRANSLATIONS_INVOKE_METHOD_NAMES = {
  SET_LANGUAGE: 'setLanguage',
  GET_LANGUAGE: 'getLanguage',
  GET_AVAILABLE_LANGUAGES: 'getAvailableLanguages',
  TRANSLATE: 'translate'
}
const MENU_INVOKE_METHOD_NAMES = {
  GET_MENU_TEMPLATE: 'getMenuTemplate',
  EXEC_MENU_CMD: 'execMenuCmd'
}
const MENU_EVENT_METHOD_NAMES = {
  ON_HIDE_MENU_EVENT: 'onHideMenuEvent'
}
const THEME_INVOKE_METHOD_NAMES = {
  SET_THEME: 'setTheme',
  GET_THEME: 'getTheme'
}

const INVOKE_CHANNEL_MAP = new Map([
  [CHANNEL_NAMES.GENERAL, GENERAL_INVOKE_METHOD_NAMES],
  [CHANNEL_NAMES.TRANSLATIONS, TRANSLATIONS_INVOKE_METHOD_NAMES],
  [CHANNEL_NAMES.MENU, MENU_INVOKE_METHOD_NAMES],
  [CHANNEL_NAMES.THEME, THEME_INVOKE_METHOD_NAMES]
])
const EVENT_CHANNEL_MAP = new Map([
  [CHANNEL_NAMES.GENERAL, GENERAL_EVENT_METHOD_NAMES],
  [CHANNEL_NAMES.MENU, MENU_EVENT_METHOD_NAMES]
])

const getEventName = (channel, method) => {
  return `${channel}:${method}`
}

const invoke = (channel, method, args) => {
  const eventName = getEventName(channel, method)

  return ipcRenderer.invoke(eventName, args)
}

const on = (channel, method, cb) => {
  const eventName = getEventName(channel, method)

  if (typeof cb === 'function') {
    return ipcRenderer.on(eventName, (e, args) => cb(args))
  }

  return new Promise((resolve) => {
    ipcRenderer.once(eventName, (e, args) => resolve(args))
  })
}

const send = (channel, method, args) => {
  const eventName = getEventName(channel, method)

  return ipcRenderer.send(eventName, args)
}

const bfxReportElectronApi = {}

for (const [channelName, invokeMethodNames] of INVOKE_CHANNEL_MAP) {
  for (const methodName of Object.values(invokeMethodNames)) {
    bfxReportElectronApi[methodName] = (args) => {
      return invoke(channelName, methodName, args)
    }
  }
}
for (const [channelName, eventMethodNames] of EVENT_CHANNEL_MAP) {
  for (const methodName of Object.values(eventMethodNames)) {
    bfxReportElectronApi[methodName] = (args) => {
      if (methodName.startsWith('on')) {
        return on(channelName, methodName, args)
      }
      if (methodName.startsWith('send')) {
        return send(channelName, methodName, args)
      }
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
