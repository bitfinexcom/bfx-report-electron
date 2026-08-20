'use strict'

const path = require('node:path')
const {
  constants: { W_OK },
  promises: {
    access,
    mkdir,
    writeFile,
    rm
  }
} = require('node:fs')
const i18next = require('i18next')
const { v4: uuidv4 } = require('uuid')

const { getConfigsKeeperByName } = require('../configs-keeper')
const { createModalWindow } = require('../window-creators')

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

const showModalWindow = async (args) => {
  const {
    noModalWindow,
    reportFilePath
  } = args ?? {}

  if (noModalWindow) {
    return
  }

  await createModalWindow(
    {
      icon: 'warning',
      title: i18next.t('reportFolderPerm.title'),
      text: i18next.t('reportFolderPerm.message', {
        reportFilePath: `<div class="modal__text--warning modal__text--center">${reportFilePath}</div>`,
        interpolation: { escapeValue: false }
      }),
      textClassName: 'modal__text--left',
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: i18next.t('common.cancelButtonText'),
      focusCancel: true
    },
    {
      width: 600,
      height: 600,
      shouldWinBeClosedIfClickingOutside: true
    }
  )
}

const checkAccess = async (reportFilePath) => {
  await access(reportFilePath, W_OK)

  // Need to write to a real file to check the dynamic antivirus blocks
  const emptyFilePath = path.join(reportFilePath, uuidv4())

  await writeFile(emptyFilePath, 'empty')
  await rm(emptyFilePath, {
    force: true,
    maxRetries: 5,
    recursive: true
  })
}

module.exports = async (args) => {
  const { noModalWindow } = args ?? {}
  const reportFilePath = getReportFilePath(args)

  if (!path.isAbsolute(reportFilePath)) {
    return {
      reportFilePath,
      invalidPath: true,
      noWritePerm: false
    }
  }

  try {
    await checkAccess(reportFilePath)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      await showModalWindow({ noModalWindow, reportFilePath })

      return {
        reportFilePath,
        invalidPath: false,
        noWritePerm: true
      }
    }

    try {
      await mkdir(
        reportFilePath,
        { recursive: true, mode: '766' }
      )
      await checkAccess(reportFilePath)

      return {
        reportFilePath,
        invalidPath: false,
        noWritePerm: false
      }
    } catch (err) {
      console.debug(err)
    }

    await showModalWindow({ noModalWindow, reportFilePath })

    return {
      reportFilePath,
      invalidPath: false,
      noWritePerm: true
    }
  }

  return {
    reportFilePath,
    invalidPath: false,
    noWritePerm: false
  }
}
