'use strict'

const { app } = require('electron')

const initializeApp = require('./src/initialize-app')
const makeSingleInstance = require('./src/make-single-instance')

const shouldQuit = makeSingleInstance()

if (shouldQuit) {
  app.quit()
} else {
  initializeApp()
    .catch((err) => {
      console.error(err)
    })
}
