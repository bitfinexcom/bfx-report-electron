'use strict'

const { app } = require('electron')
const path = require('path')
const { rootPath: appDir } = require('electron-root-path')

const {
  build: { productName }
} = require(path.join(appDir, 'package.json'))
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
