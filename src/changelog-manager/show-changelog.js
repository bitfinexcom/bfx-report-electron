'use strict'

const i18next = require('i18next')

const showDocs = require('../show-docs')
const initChangelog = require('./init-changelog')

module.exports = async (params = {}) => {
  try {
    const {
      shouldBeShown,
      version,
      changelog,
      mdEntries,
      mdEntry
    } = await initChangelog(params)

    if (!shouldBeShown) {
      return {
        error: null,
        isShown: false
      }
    }

    const mdTitle = `# ${mdEntries.title}`
    const versionTitle = `## ${mdEntry.title}`
    const mdDoc = `${mdTitle}\n\n${versionTitle}\n\n${mdEntry.body}`

    const res = await showDocs({
      title: i18next.t('changelog.modalDialog.title', { version }),
      mdDoc,
      showConfirmButton: true,
      confirmButtonText: i18next
        .t('changelog.modalDialog.confirmButtonText')
    })

    if (res?.dismiss === 'confirm') {
      await showDocs({
        title: i18next
          .t('changelog.modalDialog.fullChangelogTitle'),
        showWinCloseButton: true,
        mdDoc: changelog
      })
    }

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
