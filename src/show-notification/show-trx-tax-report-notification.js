'use strict'

const PROCESS_MESSAGES = require(
  '../../bfx-reports-framework/workers/loc.api/process.message.manager/process.messages'
)
const wins = require('../window-creators/windows')
const { isWindowInvisible } = require('../helpers/manage-window')
const showNotification = require('./')

module.exports = (mess) => {
  const {
    state = ''
  } = mess ?? {}

  if (!isWindowInvisible(wins?.mainWindow)) {
    return
  }

  const isError = state === PROCESS_MESSAGES.ERROR_TRX_TAX_REPORT
  const body = isError
    ? 'An unexpected error occurred while generating the tax report!'
    : 'Your tax report is ready!'
  const urgency = isError ? 'critical' : 'normal'

  showNotification({ body, urgency })
}
