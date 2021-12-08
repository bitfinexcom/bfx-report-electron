'use strict'

const path = require('path')
const parseChangelog = require('changelog-parser')
const { rootPath } = require('electron-root-path')

const changelogPath = path.join(rootPath, 'CHANGELOG.md')

// TODO:
module.exports = async () => {
  try {
    const mdEntries = await parseChangelog({
      filePath: changelogPath,
      removeMarkdown: false
    })

    return true
  } catch (err) {
    console.error(err)

    return false
  }
}
