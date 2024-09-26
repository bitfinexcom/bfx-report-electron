'use strict'

const { app } = require('electron')
const i18next = require('i18next')
const Backend = require('i18next-fs-backend')
const path = require('path')
const fs = require('fs')
const { rootPath } = require('electron-root-path')

const transPath = path.join(rootPath, 'build/locales')
const allFileNames = fs.readdirSync(transPath)
const availableLanguages = [...allFileNames.reduce((accum, fileName) => {
  const filePath = path.join(transPath, fileName)
  const stats = fs.lstatSync(filePath)

  if (stats.isDirectory()) {
    accum.add(fileName)
  }

  return accum
}, new Set())]

let i18nextInstance = null

// TODO:
const _getDefaultLanguage = () => {
  const availableDefaultLanguages = [
    ...app.getPreferredSystemLanguages(),
    app.getLocale(),
    'en'
  ]

  return 'en'
}

const initI18next = () => {
  if (i18nextInstance) {
    return i18nextInstance
  }

  const configs = {
    initImmediate: false,
    fallbackLng: 'en',
    lng: _getDefaultLanguage(),
    ns: ['translations'],
    defaultNS: 'translations',
    preload: availableLanguages,
    backend: {
      loadPath: path.join(transPath, '{{lng}}/{{ns}}.json')
    }
  }

  i18next
    .use(Backend)
    .init(configs)
  i18nextInstance = i18next

  return i18next
}

const getAvailableLanguages = () => availableLanguages

module.exports = {
  getAvailableLanguages,
  initI18next
}
