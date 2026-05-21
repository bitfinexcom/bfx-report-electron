'use strict'

const { shell } = require('electron')

module.exports = async (url) => {
  try {
    await shell.openExternal(url)
  } catch (err) {
    console.error(`Failed to open url: ${url}`, err)
  }
}
