'use strict'

try {
  const { NODE_ENV } = require('./electronEnv.json')

  if (
    !process.env.NODE_ENV &&
    NODE_ENV
  ) {
    process.env.NODE_ENV = NODE_ENV
  }
} catch (err) {}

const { app } = require('electron')

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
      await initializeApp()
    } catch (err) {
      console.error(err)
    }
  })()
}
