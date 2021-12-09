'use strict'

const path = require('path')
const parseChangelog = require('changelog-parser')
const { rootPath } = require('electron-root-path')

const getDebugInfo = require('../helpers/get-debug-info')
const showDocs = require('../show-docs')

const changelogPath = path.join(rootPath, 'CHANGELOG.md')

module.exports = async (params = {}) => {
  try {
    const version = params?.version ?? getDebugInfo()?.version

    const mdEntries = await parseChangelog({
      filePath: changelogPath,
      removeMarkdown: false
    })

    if (
      !mdEntries?.title ||
      !Array.isArray(mdEntries?.versions) ||
      mdEntries?.versions.length === 0
    ) {
      return true
    }

    const mdEntry = mdEntries.versions
      .find((item) => item?.version === version)

    if (
      !mdEntry?.title ||
      !mdEntry?.body
    ) {
      return true
    }

    const mdTitle = `# ${mdEntries.title}`
    const versionTitle = `## ${mdEntry.title}`
    const mdDoc = `${mdTitle}\n\n${versionTitle}\n\n${mdEntry.body}`

    await showDocs({
      title: mdEntries.title,
      mdDoc
    })

    return true
  } catch (err) {
    console.error(err)

    return false
  }
}
