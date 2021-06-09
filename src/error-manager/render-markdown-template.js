'use strict'

const fs = require('fs')
const path = require('path')

const truncateLog = require('./truncate-log')
const getNewGithubIssueUrl = require('./get-new-github-issue-url')

const templateByDefault = fs.readFileSync(
  path.join(__dirname, 'github-issue-template.md'),
  'utf8'
)
const placeholderPattern = new RegExp(/\$\{[a-zA-Z0-9]+\}/, 'g')

// The GitHub GET endpoint for opening a new issue
// has a restriction for maximum length of a URL: 8192 bytes
// https://github.com/cli/cli/pull/3271
// https://github.com/cli/cli/issues/1575
// https://github.com/cli/cli/blob/trunk/pkg/cmd/issue/create/create.go#L167
// https://github.com/cli/cli/blob/trunk/utils/utils.go#L84
//
// But there is a restriction is max 2081 characters on windows
// https://github.com/electron/electron/blob/main/docs/api/shell.md#shellopenexternalurl-options
// https://github.com/electron/electron/issues/12416#issuecomment-376596073
const maxIssueBytes = process.platform === 'win32'
  ? 2080
  : 8150

const _getURLByteLength = (body, params) => {
  const urlStr = getNewGithubIssueUrl({
    ...params,
    body
  })

  return Buffer.byteLength(urlStr, 'utf8')
}

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

const _getTruncatedMarkdownTemplate = (
  allowedByteLengthForLogs,
  orderedLogsArr,
  params,
  template
) => {
  const logsLength = orderedLogsArr.length
  const _logs = {}
  let allowedByteLengthForOneLog = Math.floor(
    allowedByteLengthForLogs / logsLength
  )
  let count = 0

  for (const [propName, log] of orderedLogsArr) {
    count += 1
    const logByteLength = _getURLByteLength(log, params)

    if (allowedByteLengthForOneLog >= logByteLength) {
      _logs[propName] = log

      if (allowedByteLengthForOneLog > logByteLength) {
        allowedByteLengthForOneLog += Math.floor(
          (allowedByteLengthForOneLog - logByteLength) / (logsLength - count)
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

  const mdIssueByteLength = _getURLByteLength(
    mdWithoutLogs,
    params
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
  let allowedByteLengthForLogs = maxIssueBytes - mdIssueByteLength

  while (true) {
    const md = _getTruncatedMarkdownTemplate(
      allowedByteLengthForLogs,
      orderedLogsArr,
      params,
      template
    )
    const byteLength = _getURLByteLength(md, params)

    if (byteLength <= maxIssueBytes) {
      return md
    }

    allowedByteLengthForLogs -= 100
  }
}
