'use strict'

const PROCESS_MESSAGES = require(
  '../../bfx-reports-framework/workers/loc.api/process.message.manager/process.messages'
)
const wins = require('../window-creators/windows')
const { isWindowInvisible } = require('../helpers/manage-window')
const showNotification = require('./')

const getBody = (params) => {
  const {
    isError,
    isInterrupted
  } = params ?? {}

  if (isError) {
    return 'Data sync completed with an error!'
  }
  if (isInterrupted) {
    return 'Data sync interrupted!'
  }

  return 'Data sync completed successfully!'
}

module.exports = (mess) => {
  const {
    state = '',
    data = {}
  } = mess ?? {}

  if (!isWindowInvisible(wins?.mainWindow)) {
    return
  }

  const isError = state === PROCESS_MESSAGES.ERROR_SYNC
  const isInterrupted = !!data?.isInterrupted

  const body = getBody({ isError, isInterrupted })
  const urgency = isError ? 'critical' : 'normal'

  showNotification({ body, urgency })
}
