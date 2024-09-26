'use strict'

const i18next = require('i18next')
const Backend = require('i18next-fs-backend')
const path = require('path')
const fs = require('fs')
const { rootPath } = require('electron-root-path')

const transPath = path.join(rootPath, 'build/locales')
const allFileNames = fs.readdirSync(transPath)

let i18nextInstance = null

const initI18next = () => {
  if (i18nextInstance) {
    return i18nextInstance
  }

  const configs = {
    initImmediate: false,
    fallbackLng: 'en',
    lng: 'en',
    ns: ['translations'],
    defaultNS: 'translations',
    preload: [...allFileNames.reduce((accum, fileName) => {
      const filePath = path.join(transPath, fileName)
      const stats = fs.lstatSync(filePath)

      if (stats.isDirectory()) {
        accum.add(fileName)
      }

      return accum
    }, new Set())],
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

module.exports = {
  initI18next
}
