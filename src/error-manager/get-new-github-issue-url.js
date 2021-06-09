'use strict'

const newGithubIssueUrl = require('new-github-issue-url')

module.exports = (params) => {
  const {
    repo,
    owner,
    title,
    body
  } = params

  const url = newGithubIssueUrl({
    repo,
    user: owner,
    title,
    body
  })

  return url
}
