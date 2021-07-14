'use strict'

const os = require('os')
const truncate = require('truncate-utf8-bytes')

const reverseLog = (log) => {
  return log
    .split(os.EOL)
    .reverse()
    .join(os.EOL)
}

module.exports = (log, byteLimit) => {
  const reversedLog = reverseLog(log)
  const truncatedLog = truncate(reversedLog, byteLimit)

  return reverseLog(truncatedLog)
}
