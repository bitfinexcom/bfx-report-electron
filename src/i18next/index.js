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

const _getLanguageFromAvailableOnes = (language) => {
  const lngs = getAvailableLanguages()

  if (lngs.some((lng) => lng === language)) {
    return language
  }

  const lng = lngs.find((lng) => (
    lng.startsWith(language) ||
    language.startsWith(lng)
  ))

  if (lng) {
    return lng
  }

  const normalizedLng = language.replace(/-\S*/, '')

  return lngs.find((lng) => lng.startsWith(normalizedLng))
}

const _getDefaultLanguage = () => {
  const defaultLanguages = [
    ...app.getPreferredSystemLanguages(),
    app.getLocale(),
    'en'
  ]

  for (const defaultLanguage of defaultLanguages) {
    const availableLanguage = _getLanguageFromAvailableOnes(defaultLanguage)

    if (
      availableLanguage &&
      typeof availableLanguage === 'string'
    ) {
      return availableLanguage
    }
  }

  return 'en'
}

const initI18next = () => {
  if (i18nextInstance) {
    return i18nextInstance
  }

  const configs = {
    initImmediate: false,
    fallbackLng: {
      es: ['es-EM'],
      pt: ['pt-BR'],
      zh: ['zh-CN'],
      default: ['en']
    },
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
