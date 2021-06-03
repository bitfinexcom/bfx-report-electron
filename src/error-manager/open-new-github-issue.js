'use strict'

const { shell } = require('electron')
const getNewGithubIssueUrl = require('./get-new-github-issue-url')

const getDebugInfo = require('../helpers/get-debug-info')

module.exports = (opts) => {
  const {
    repo,
    owner
  } = getDebugInfo()

  const _opts = {
    repo,
    owner,
    ...opts
  }
  const url = getNewGithubIssueUrl(_opts)

  return shell.openExternal(url)
}
