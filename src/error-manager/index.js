'use strict'

const log = require('electron-log')

const isDevEnv = process.env.NODE_ENV === 'development'

const showModalDialog = require('./show-modal-dialog')
const renderMarkdownTemplate = require('./render-markdown-template')
const openNewGithubIssue = require('./open-new-github-issue')
const collectLogs = require('./collect-logs')
const getDebugInfo = require('../helpers/get-debug-info')

const manageNewGithubIssue = async () => {
  try {
    const debugInfo = getDebugInfo()
    const logs = await collectLogs()

    const mdIssue = renderMarkdownTemplate({
      mainLog: 'Empty',
      workerErrors: 'Empty',
      workerExceptions: 'Empty',
      ...debugInfo,
      ...logs
    })

    const {
      isNewGithubIssueOpened
    } = await showModalDialog(mdIssue)

    if (isNewGithubIssueOpened) {
      openNewGithubIssue({
        title: '[BUG REPORT]',
        body: mdIssue
      })
    }
  } catch (err) {
    console.error(err)
  }
}

const initLogger = () => {
  log.transports.console.level = isDevEnv
    ? 'debug'
    : 'warn'
  log.transports.file.level = isDevEnv
    ? 'info'
    : 'warn'

  // Override console.log and console.error etc
  Object.assign(console, log.functions)

  return log
}

module.exports = {
  get log () { return log },

  initLogger,
  manageNewGithubIssue
}
