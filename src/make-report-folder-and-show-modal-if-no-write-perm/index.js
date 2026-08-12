'use strict'

const path = require('node:path')
const {
  constants: { W_OK },
  promises: {
    access,
    mkdir
  }
} = require('node:fs')

const { getConfigsKeeperByName } = require('../configs-keeper')

const getReportFilePath = (args) => {
  const {
    pathToUserReportFiles
  } = args ?? {}

  if (pathToUserReportFiles) {
    return pathToUserReportFiles
  }

  const savedPathToUserReportFiles = getConfigsKeeperByName()
    .getConfigByName('pathToUserReportFiles')

  return savedPathToUserReportFiles
}

// TODO:
const showModalWindow = async (args) => {
  const {
    noModalWindow,
    reportFilePath
  } = args ?? {}

  if (noModalWindow) {
    return
  }
}

module.exports = async (args) => {
  const { noModalWindow } = args ?? {}
  const reportFilePath = getReportFilePath(args)

  if (!path.isAbsolute(reportFilePath)) {
    return {
      invalidPath: true,
      noWritePerm: false
    }
  }

  try {
    await access(reportFilePath, W_OK)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      await showModalWindow({ noModalWindow, reportFilePath })

      return {
        invalidPath: false,
        noWritePerm: true
      }
    }

    try {
      await mkdir(
        reportFilePath,
        { recursive: true, mode: '766' }
      )
      await access(reportFilePath, W_OK)
    } catch (err) {
      await showModalWindow({ noModalWindow, reportFilePath })

      return {
        invalidPath: false,
        noWritePerm: true
      }
    }

    return {
      invalidPath: false,
      noWritePerm: false
    }
  }
}
