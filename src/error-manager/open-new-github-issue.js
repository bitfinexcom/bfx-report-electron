'use strict'

const { shell } = require('electron')
const newGithubIssueUrl = require('new-github-issue-url')

const getDebugInfo = require('../helpers/get-debug-info')

module.exports = (opts) => {
  const {
    repo,
    owner
  } = getDebugInfo()

  const _opts = {
    repo,
    user: owner,
    ...opts
  }
  const url = newGithubIssueUrl(_opts)

  shell.openExternal(url)
}
