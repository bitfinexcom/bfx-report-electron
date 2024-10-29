'use strict'

const i18next = require('i18next')

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
    return i18next.t('common.nativeNotification.sync.errorBody')
  }
  if (isInterrupted) {
    return i18next.t('common.nativeNotification.sync.interruptedBody')
  }

  return i18next.t('common.nativeNotification.sync.completedBody')
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
