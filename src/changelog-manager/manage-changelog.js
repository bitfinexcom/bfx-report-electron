'use strict'

const { compare } = require('compare-versions')

const {
  getConfigsKeeperByName
} = require('../configs-keeper')
const getDebugInfo = require('../helpers/get-debug-info')

const showChangelog = require('./show-changelog')

module.exports = async () => {
  try {
    const { version } = getDebugInfo()
    const configsKeeper = getConfigsKeeperByName('main')
    const shownChangelogVer = await configsKeeper
      .getConfigByName('shownChangelogVer')

    if (compare(version, shownChangelogVer, '<=')) {
      return
    }

    await showChangelog()
  } catch (err) {
    console.error(err)
  }
}
