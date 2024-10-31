'use strict'

try {
  const envVars = require('./electronEnv.json')

  for (const [key, val] of Object.entries(envVars)) {
    if (typeof process.env[key] !== 'undefined') {
      continue
    }

    process.env[key] = val
  }
} catch (err) {}
try {
  // Uses only in dev mode as dotenv is added into dev deps
  require('dotenv').config({ override: true })
} catch (err) {}

const { app } = require('electron')
require('./src/i18next')
  .initI18next()

const isTestEnv = process.env.NODE_ENV === 'test'

const productName = require('./src/helpers/product-name')
app.setName(productName)

process.traceProcessWarnings = true
app.allowRendererProcessReuse = true

require('./src/error-manager')
  .initLogger()

const initializeApp = require('./src/initialize-app')
const makeSingleInstance = require('./src/make-single-instance')

const shouldQuit = makeSingleInstance()

if (shouldQuit) {
  app.quit()
} else {
  ;(async () => {
    try {
      if (isTestEnv) {
        require('wdio-electron-service/main')
      }

      await initializeApp()
    } catch (err) {
      console.error(err)
    }
  })()
}
