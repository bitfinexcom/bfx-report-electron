'use strict'

const { app } = require('electron')
const os = require('os')
const cleanStack = require('clean-stack')
const i18next = require('i18next')

const isDevEnv = process.env.NODE_ENV === 'development'

const { isENetError } = require(
  '../../bfx-reports-framework/workers/loc.api/helpers/api-errors-testers'
)

const log = require('./log')
const getErrorDescription = require('./get-error-description')
const showModalDialog = require('./show-modal-dialog')
const renderMarkdownTemplate = require('./render-markdown-template')
const openNewGithubIssue = require('./open-new-github-issue')
const collectLogs = require('./collect-logs')
const getDebugInfo = require('../helpers/get-debug-info')

const MENU_ITEM_IDS = require('../create-menu/menu.item.ids')
const { changeMenuItemStatesById } = require('../create-menu/utils')

let _isLocked = false
let _isIssueAutoManagerLocked = false
let caughtError

const _manageErrorLogLevel = async (error) => {
  try {
    if (
      !error ||
      typeof error !== 'string'
    ) {
      return
    }

    caughtError = error

    if (_isIssueAutoManagerLocked) {
      return
    }

    _isIssueAutoManagerLocked = true

    setTimeout(() => {
      _isIssueAutoManagerLocked = false

      if (
        !caughtError ||
        typeof caughtError !== 'string'
      ) {
        return
      }

      _manageErrorLogLevel(caughtError)
    }, 30 * 60 * 1000).unref()

    const isReported = await manageNewGithubIssue({ error })

    if (isReported) {
      caughtError = null
    }
  } catch (err) {
    _isIssueAutoManagerLocked = false

    console.error(err)
  }
}

const _getErrorStr = (val) => {
  if (!(val instanceof Error)) {
    return val
  }

  const str = typeof val.stack === 'string'
    ? val.stack
    : val.toString()

  return str
}

const _isLogSkipped = (log) => {
  const str = _getErrorStr(log)

  return (
    str &&
    typeof str === 'string' &&
    (
      str.includes('contextIsolation is deprecated') ||
      str.includes('ERR_INTERNET_DISCONNECTED') ||
      // Skip error when can't get code signature on mac
      str.includes('Could not get code signature') ||
      str.includes('ERR_BFX_API_SERVER_IS_NOT_AVAILABLE') ||
      str.includes('database is locked') ||
      str.includes('network timeout')
    )
  )
}

const _lockIssueManager = () => {
  _isLocked = true

  changeMenuItemStatesById(
    MENU_ITEM_IDS.REPORT_BUG_MENU_ITEM,
    { enabled: false }
  )
}

const _unlockIssueManager = () => {
  _isLocked = false

  changeMenuItemStatesById(
    MENU_ITEM_IDS.REPORT_BUG_MENU_ITEM,
    { enabled: true }
  )
}

const manageNewGithubIssue = async (params) => {
  try {
    if (_isLocked) {
      return false
    }

    _lockIssueManager()

    const debugInfo = getDebugInfo()
    const logs = await collectLogs()

    const {
      title,
      description,
      errBoxTitle,
      errBoxDescription
    } = getErrorDescription(params)

    const mdIssue = renderMarkdownTemplate(
      {
        title,
        description,
        ...params,
        ...debugInfo
      },
      logs
    )

    const {
      isExit,
      isReported
    } = await showModalDialog({
      errBoxTitle,
      errBoxDescription,
      mdIssue
    })

    if (isReported) {
      await openNewGithubIssue({
        title,
        body: mdIssue
      })
    }
    if (isExit) {
      app.quit()
    }

    _unlockIssueManager()

    return isReported
  } catch (err) {
    _unlockIssueManager()
    _isIssueAutoManagerLocked = false

    console.error(err)
  }
}

const initLogger = () => {
  log.transports.ipc.level = false
  log.transports.console.level = isDevEnv
    ? 'debug'
    : 'warn'
  log.transports.file.level = isDevEnv
    ? 'info'
    : 'warn'

  // Clean up error stack traces for file transport
  log.hooks.push((message, transport) => {
    if (
      transport !== log.transports.file ||
      !Array.isArray(message.data) ||
      message.data.length === 0
    ) {
      return message
    }
    if (message.data.some((val) => _isLogSkipped(val))) {
      return false
    }

    message.data = message.data.map((val) => {
      if (typeof val === 'string') {
        return cleanStack(val)
      }
      if (val instanceof Error) {
        const str = typeof val.stack === 'string'
          ? val.stack
          : val.toString()

        return cleanStack(str)
      }

      return val
    })

    if (message.level === 'error') {
      const error = message.data.join(os.EOL)

      if (/Failed to get 'documents' path/gi.test(error)) {
        const title = i18next.t('errorManager.failedToGetDocsPath.title')
        const msg = i18next.t('errorManager.failedToGetDocsPath.message')

        showModalDialog({
          errBoxTitle: title,
          errBoxDescription: msg,
          mdIssue: msg,
          alertOpts: {
            icon: 'error',
            title,
            showConfirmButton: false,
            hasNoParentWin: true
          }
        })
          .then(() => { app.exit() })
          .catch((err) => { console.error(err) })

        return
      }

      /*
       * Don't open a new issue when:
       *   - It can't download differentially it would fallback to full download
       *   - GitHub server can't respond to the auto-update requests
       */
      if (
        isENetError(error) ||
        /Cannot download differentially/gi.test(error) ||
        /objects\.githubusercontent\.com/gi.test(error) ||
        /Error: ERR_FAILED \(-2\) loading 'file:.*\.html'/gi.test(error) ||
        /Failed to generate PDF/gi.test(error)
      ) {
        return message
      }

      _manageErrorLogLevel(error)
    }

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
