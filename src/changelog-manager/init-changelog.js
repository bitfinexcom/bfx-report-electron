'use strict'

const path = require('node:path')
const fs = require('node:fs')
const parseChangelog = require('changelog-parser')

const getDebugInfo = require('../helpers/get-debug-info')
const MENU_ITEM_IDS = require('../create-menu/menu.item.ids')
const { changeMenuItemStatesById } = require('../create-menu/utils')
const { rootPath } = require('../helpers/root-path')

const changelogPath = path.join(rootPath, 'CHANGELOG.md')
const changelog = fs.readFileSync(changelogPath, 'utf8')

let mdEntries = null

const disableShowChangelogMenuItem = () => {
  changeMenuItemStatesById(
    MENU_ITEM_IDS.SHOW_CHANGE_LOG_MENU_ITEM,
    { enabled: false }
  )
}

module.exports = async (params) => {
  const version = params?.version ?? getDebugInfo()?.version

  mdEntries = mdEntries ?? await parseChangelog({
    text: changelog,
    removeMarkdown: false
  })

  if (
    !mdEntries?.title ||
    !Array.isArray(mdEntries?.versions) ||
    mdEntries?.versions.length === 0
  ) {
    disableShowChangelogMenuItem()

    return {
      shouldBeShown: false,
      version,
      changelog,
      mdEntries,
      mdEntry: null
    }
  }

  const mdEntry = mdEntries.versions
    .find((item) => item?.version === version)
  const shouldBeShown = (
    mdEntry?.title &&
    mdEntry?.body
  )

  if (!shouldBeShown) {
    disableShowChangelogMenuItem()
  }

  return {
    shouldBeShown,
    version,
    changelog,
    mdEntries,
    mdEntry
  }
}
