'use strict'

const { app, Menu } = require('electron')
const log = require('electron-log')
const cleanStack = import('clean-stack')

const isDevEnv = process.env.NODE_ENV === 'development'

const getErrorDescription = require('./get-error-description')
const showModalDialog = require('./show-modal-dialog')
const renderMarkdownTemplate = require('./render-markdown-template')
const openNewGithubIssue = require('./open-new-github-issue')
const collectLogs = require('./collect-logs')
const getDebugInfo = require('../helpers/get-debug-info')

let _isLocked = false

const _getReportBugMenuItem = () => {
  const menu = Menu.getApplicationMenu()

  if (!menu) {
    return
  }

  return menu.getMenuItemById('REPORT_BUG_MENU_ITEM')
}

const _lockIssueManager = () => {
  _isLocked = true
  _getReportBugMenuItem().enabled = false
}

const _unlockIssueManager = () => {
  _isLocked = false
  _getReportBugMenuItem().enabled = true
}

const manageNewGithubIssue = async (params) => {
  try {
    if (_isLocked) {
      return
    }

    _lockIssueManager()

    const debugInfo = getDebugInfo()
    const logs = await collectLogs()

    const {
      title,
      description,
      isError,
      errBoxTitle,
      errBoxDescription
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
      isExit,
      isReported,
      isIgnored
    } = await showModalDialog({
      isError,
      errBoxTitle,
      errBoxDescription,
      mdIssue
    })

    if (isIgnored) {
      _unlockIssueManager()

      return
    }
    if (isReported) {
      openNewGithubIssue({
        title,
        body: mdIssue
      })
    }
    if (isExit) {
      app.quit()
    }

    _unlockIssueManager()
  } catch (err) {
    _unlockIssueManager()

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
      manageNewGithubIssue({ error })
    }
  })

  return log
}

module.exports = {
  get log () { return log },

  initLogger,
  manageNewGithubIssue
}
