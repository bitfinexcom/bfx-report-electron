'use strict'

const path = require('path')
const parseChangelog = require('changelog-parser')
const { rootPath } = require('electron-root-path')

const getDebugInfo = require('../helpers/get-debug-info')

const changelogPath = path.join(rootPath, 'CHANGELOG.md')

// TODO:
module.exports = async (params = {}) => {
  try {
    const version = params?.version ?? getDebugInfo()?.version

    const mdEntries = await parseChangelog({
      filePath: changelogPath,
      removeMarkdown: false
    })

    if (
      !Array.isArray(mdEntries?.versions) ||
      mdEntries?.versions.length === 0
    ) {
      return true
    }

    const mdEntry = mdEntries.versions
      .find((item) => item?.version === version)

    return true
  } catch (err) {
    console.error(err)

    return false
  }
}
