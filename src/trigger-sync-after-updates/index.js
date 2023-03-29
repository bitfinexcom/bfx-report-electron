'use strict'

const PROCESS_MESSAGES = require(
  '../../bfx-reports-framework/workers/loc.api/process.message.manager/process.messages'
)
const PROCESS_STATES = require(
  '../../bfx-reports-framework/workers/loc.api/process.message.manager/process.states'
)

const ipcs = require('../ipcs')
const {
  deserializeError
} = require('../helpers/utils')
const {
  getConfigsKeeperByName
} = require('../configs-keeper')
const getDebugInfo = require('../helpers/get-debug-info')
const {
  TriggeringSyncAfterUpdatesError
} = require('../errors')

const _requestSyncAfterUpdates = (opts) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        msTimeout = 30 * 1000
      } = opts ?? {}

      let timeout = null

      const rmHandler = () => {
        ipcs.serverIpc.off('message', handler)
        clearTimeout(timeout)
      }
      const handler = (mess) => {
        const { state, data } = mess ?? {}

        if (state !== PROCESS_MESSAGES.RESPONSE_UPDATE_USERS_SYNC_ON_STARTUP_REQUIRED_STATE) {
          return
        }

        timeout = setTimeout(() => {
          rmHandler()
          reject(new TriggeringSyncAfterUpdatesError())
        }, msTimeout).unref()

        if (data?.err) {
          rmHandler()
          reject(deserializeError(data.err))

          return
        }

        rmHandler()
        resolve(data?.isDone)
      }

      ipcs.serverIpc.on('message', handler)
      ipcs.serverIpc.send({
        state: PROCESS_STATES.REQUEST_UPDATE_USERS_SYNC_ON_STARTUP_REQUIRED_STATE
      })
    } catch (err) {
      reject(err)
    }
  })
}

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
    const wasSaved = await configsKeeper
      .saveConfigs({ triggeredSyncAfterUpdatesVer: version })

    if (
      wasRequested &&
      wasSaved
    ) {
      return
    }

    throw new TriggeringSyncAfterUpdatesError()
  } catch (err) {
    console.error(err)
  }
}
