'use strict'

const {
  getConfigsKeeperByName
} = require('../configs-keeper')
const getDebugInfo = require('../helpers/get-debug-info')
const {
  TriggeringSyncAfterUpdatesError
} = require('../errors')

// TODO:
const _requestSyncAfterUpdates = async () => {}

module.exports = async () => {
  try {
    const { version } = getDebugInfo()
    const configsKeeper = getConfigsKeeperByName('main')
    const triggeredSyncAfterUpdatesVer = await configsKeeper
      .getConfigByName('triggeredSyncAfterUpdatesVer')

    if (version === triggeredSyncAfterUpdatesVer) {
      return
    }

    const wasRequested = await _requestSyncAfterUpdates()

    if (wasRequested) {
      return
    }

    throw new TriggeringSyncAfterUpdatesError()
  } catch (err) {
    console.error(err)
  }
}
