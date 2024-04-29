'use strict'

const { Menu } = require('electron')
const path = require('path')
const parseChangelog = require('changelog-parser')
const { rootPath } = require('electron-root-path')

const getDebugInfo = require('../helpers/get-debug-info')
const showDocs = require('../show-docs')

const MENU_ITEM_IDS = require('../create-menu/menu.item.ids')

const changelogPath = path.join(rootPath, 'CHANGELOG.md')

const disableShowChangelogMenuItem = () => {
  const menuItem = Menu.getApplicationMenu()
    ?.getMenuItemById(MENU_ITEM_IDS.SHOW_CHANGE_LOG_MENU_ITEM) ?? {}

  menuItem.enabled = false
}

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
      disableShowChangelogMenuItem()

      return {
        error: null,
        isShown: false
      }
    }

    const mdEntry = mdEntries.versions
      .find((item) => item?.version === version)

    if (
      !mdEntry?.title ||
      !mdEntry?.body
    ) {
      disableShowChangelogMenuItem()

      return {
        error: null,
        isShown: false
      }
    }

    const mdTitle = `# ${mdEntries.title}`
    const versionTitle = `## ${mdEntry.title}`
    const mdDoc = `${mdTitle}\n\n${versionTitle}\n\n${mdEntry.body}`

    await showDocs({
      title: mdEntries.title,
      mdDoc
    })

    return {
      error: null,
      isShown: true
    }
  } catch (error) {
    console.error(error)

    return {
      error,
      isShown: false
    }
  }
}
