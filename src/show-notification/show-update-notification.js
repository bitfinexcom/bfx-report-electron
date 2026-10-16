'use strict'

const wins = require('../window-creators/windows')
const { isWindowInvisible } = require('../helpers/manage-window')
const notify = require('./notify')

module.exports = (args) => {
  const {
    title,
    isError
  } = args ?? {}

  if (
    !isWindowInvisible(
      wins?.mainWindow,
      { shouldChildWinsBeChecked: true }
    ) ||
    typeof title !== 'string' ||
    !title
  ) {
    return
  }

  const urgency = isError ? 'critical' : 'normal'

  notify({ body: title, urgency })
}
