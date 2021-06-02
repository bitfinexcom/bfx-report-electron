'use strict'

const fs = require('fs')
const path = require('path')

const truncateLog = require('./truncate-log')

const templateByDefault = fs.readFileSync(
  path.join(__dirname, 'github-issue-template.md'),
  'utf8'
)
const placeholderPattern = new RegExp(/\$\{[a-zA-Z0-9]+\}/, 'g')

const maxIssueBytes = 6500

const _renderMarkdownTemplate = (
  params = {},
  template
) => {
  const str = template.replace(placeholderPattern, (match) => {
    const propName = match.replace('${', '').replace('}', '')

    if (
      !params ||
      typeof params !== 'object' ||
      (
        !Number.isFinite(params[propName]) &&
        typeof params[propName] !== 'string'
      )
    ) {
      return ''
    }

    return params[propName]
  })

  return str
}

module.exports = (
  params = {},
  logs = {},
  template = templateByDefault
) => {
  if (
    !params ||
    typeof params !== 'object'
  ) {
    return template
  }

  const logsArr = Object.entries(logs)
  const emptyLogsArr = logsArr.reduce(
    (accum, [propName]) => {
      accum[propName] = ''

      return accum
    },
    {}
  )

  const mdWithoutLogs = _renderMarkdownTemplate(
    {
      ...params,
      ...emptyLogsArr
    },
    template
  )

  const mdIssueByteLength = Buffer.byteLength(
    mdWithoutLogs,
    'utf8'
  )

  if (
    mdIssueByteLength >= maxIssueBytes ||
    logsArr.length === 0
  ) {
    return mdWithoutLogs
  }

  const orderedLogsArr = logsArr.sort((fEl, sEl) => (
    Buffer.byteLength(fEl[1], 'utf8') - Buffer.byteLength(sEl[1], 'utf8')
  ))
  const allowedByteLengthForLogs = maxIssueBytes - mdIssueByteLength
  const _logs = {}
  let allowedByteLengthForOneLog = Math.floor(
    allowedByteLengthForLogs / logsArr.length
  )
  let count = 0

  for (const [propName, log] of orderedLogsArr) {
    count += 1
    const logByteLength = Buffer.byteLength(log, 'utf8')

    if (allowedByteLengthForOneLog >= logByteLength) {
      _logs[propName] = log

      if (allowedByteLengthForOneLog > logByteLength) {
        allowedByteLengthForOneLog += Math.floor(
          (allowedByteLengthForOneLog - logByteLength) / (logsArr.length - count)
        )
      }

      continue
    }

    const truncatedLog = truncateLog(log, allowedByteLengthForOneLog)

    _logs[propName] = truncatedLog
  }

  const md = _renderMarkdownTemplate(
    {
      ...params,
      ..._logs
    },
    template
  )

  return md
}
