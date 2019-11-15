'use strict'

const fs = require('fs')

const checkAndChangeAccess = (path) => {
  try {
    fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK)
  } catch (err) {
    fs.chmodSync(path, '766')
  }
}

module.exports = {
  checkAndChangeAccess
}
