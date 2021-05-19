'use strict'

const { app } = require('electron')
const log = require('electron-log')
const cleanStack = require('clean-stack')

const isDevEnv = process.env.NODE_ENV === 'development'

const getErrorDescription = require('./get-error-description')
const showModalDialog = require('./show-modal-dialog')
const renderMarkdownTemplate = require('./render-markdown-template')
const openNewGithubIssue = require('./open-new-github-issue')
const collectLogs = require('./collect-logs')
const getDebugInfo = require('../helpers/get-debug-info')

const manageNewGithubIssue = async (params) => {
  try {
    const debugInfo = getDebugInfo()
    const logs = await collectLogs()

    const {
      title,
      description
    } = getErrorDescription(params)

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

  // Clean up error stack traces
  log.hooks.push((message, transport) => {
    if (
      transport !== log.transports.file ||
      !Array.isArray(message.data) ||
      message.data.length === 0
    ) {
      return message
    }

    message.data = message.data.map((val) => {
      if (
        !(val instanceof Error) ||
        !val.stack
      ) {
        return val
      }

      return cleanStack(val.stack)
    })

    return message
  })

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
