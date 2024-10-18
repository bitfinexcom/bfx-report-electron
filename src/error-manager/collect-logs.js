'use strict'

const { promisify } = require('util')
const path = require('path')
const fs = require('fs')
const log = require('electron-log')

const getUserDataPath = require('../helpers/get-user-data-path')

const readFile = promisify(fs.readFile)

const truncateLog = require('./truncate-log')

const _readLogFile = async (logPath, byteLimit = 8000) => {
  try {
    const log = await readFile(logPath, 'utf8')

    if (typeof log !== 'string') {
      return 'Log file read error'
    }
    if (
      !log ||
      /^[\s]+$/.test(log)
    ) {
      return 'Empty'
    }

    return truncateLog(log, byteLimit)
  } catch (err) {
    console.error(err)

    return 'Log file read error'
  }
}

module.exports = async () => {
  const { path: mainLogPath } = log.transports.file.getFile()

  const pathToUserData = getUserDataPath()
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
