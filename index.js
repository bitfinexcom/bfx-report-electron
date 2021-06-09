'use strict'

const { app } = require('electron')

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
