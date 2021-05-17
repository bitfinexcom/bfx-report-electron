'use strict'

const { app } = require('electron')
const { promisify } = require('util')
const path = require('path')
const fs = require('fs')
const os = require('os')
const log = require('electron-log')

const readFile = promisify(fs.readFile)

const _limitLog = (log, limit = 20) => {
  return log
    .split(os.EOL)
    .slice(-limit)
    .join(os.EOL)
}

const _readLogFile = async (logPath, limit) => {
  try {
    const log = await readFile(logPath, 'utf8')

    if (typeof log !== 'string') {
      return 'Log file read error'
    }

    return _limitLog(log, limit)
  } catch (err) {
    console.error(err)

    return 'Log file read error'
  }
}

module.exports = async () => {
  const { path: mainLogPath } = log.transports.file.getFile()

  const pathToUserData = app.getPath('userData')
  const logsFolder = path.join(pathToUserData, 'logs')
  const workerErrorsPath = path.join(
    logsFolder,
    'errors-worker.log'
  )
  const workerExceptionsPath = path.join(
    logsFolder,
    'exceptions-worker.log'
  )

  const mainLog = await _readLogFile(mainLogPath)
  const workerErrors = await _readLogFile(workerErrorsPath)
  const workerExceptions = await _readLogFile(workerExceptionsPath)

  return {
    mainLog,
    workerErrors,
    workerExceptions
  }
}
