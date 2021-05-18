'use strict'

const { app } = require('electron')
const log = require('electron-log')
const os = require('os')

const isDevEnv = process.env.NODE_ENV === 'development'

const showModalDialog = require('./show-modal-dialog')
const renderMarkdownTemplate = require('./render-markdown-template')
const openNewGithubIssue = require('./open-new-github-issue')
const collectLogs = require('./collect-logs')
const getDebugInfo = require('../helpers/get-debug-info')

const _getErrorDescription = (params) => {
  const { error } = { ...params }

  const _title = '[BUG REPORT]'
  const _description = 'Bug report'

  if (
    error &&
    typeof error === 'string'
  ) {
    return {
      title: _title,
      description: [
        'An error occurred',
        '',
        '```vim',
        error,
        '```'
      ].join(os.EOL)
    }
  }
  if (error instanceof Error) {
    const errStr = error.toString()
    const stack = error.stack
      ? error.stack
      : errStr

    return {
      title: `${_title} ${errStr}`,
      description: [
        'An error occurred',
        '',
        '```vim',
        stack,
        '```'
      ].join(os.EOL)
    }
  }

  return {
    title: _title,
    description: _description
  }
}

const manageNewGithubIssue = async (params) => {
  try {
    const debugInfo = getDebugInfo()
    const logs = await collectLogs()

    const {
      title,
      description
    } = _getErrorDescription(params)

    const mdIssue = renderMarkdownTemplate({
      description,
      mainLog: 'Empty',
      workerErrors: 'Empty',
      workerExceptions: 'Empty',
      ...params,
      ...debugInfo,
      ...logs
    })

    const {
      isNewGithubIssueOpened,
      isCanceled
    } = await showModalDialog(mdIssue)

    if (isCanceled) {
      return { isCanceled }
    }
    if (isNewGithubIssueOpened) {
      openNewGithubIssue({
        title,
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

  // Catch and log unhandled errors/rejected promises
  log.catchErrors({
    showDialog: false,
    onError (error) {
      manageNewGithubIssue({ error }).then(({
        isCanceled
      }) => {
        if (isCanceled) {
          app.quit()
        }
      })
    }
  })

  return log
}

module.exports = {
  get log () { return log },

  initLogger,
  manageNewGithubIssue
}
