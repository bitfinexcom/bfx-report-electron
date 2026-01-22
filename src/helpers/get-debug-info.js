'use strict'

const path = require('path')
const os = require('os')
const v8 = require('v8')

const { getAppUpdateConfigSync } = require('../auto-updater')

const { rootPath } = require('./root-path')
const packageJson = require(path.join(rootPath, 'package.json'))
const productName = require('./product-name')
const isBfxApiStaging = require('./is-bfx-api-staging')

let lastCommit = { hash: '-', date: '-' }

const appUpdateConfig = getAppUpdateConfigSync()

try {
  lastCommit = require(path.join(rootPath, 'lastCommit.json'))
} catch (err) {
  console.error(err)
}

const _getMemoryDivider = (measure = 'GB') => {
  const unit = 1024

  if (measure === 'GB') {
    return Math.pow(unit, 3)
  }
  if (measure === 'MB') {
    return Math.pow(unit, 2)
  }

  return 1
}

const _roundMemorySize = (amount, measure = 'GB') => {
  if (
    !Number.isFinite(amount) ||
    amount === 0 ||
    (
      measure !== 'GB' &&
      measure !== 'MB'
    )
  ) {
    return amount
  }

  const absAmount = Math.abs(amount)
  const divider = _getMemoryDivider(measure)

  return Math.round((absAmount / divider) * 100) / 100
}

const _getRamInfo = () => {
  const totalmem = os.totalmem()
  const freemem = os.freemem()
  const {
    heap_size_limit: heapSizeLimit,
    used_heap_size: usedHeapSize
  } = v8.getHeapStatistics()

  return {
    totalRamGb: _roundMemorySize(totalmem, 'GB'),
    freeRamGb: _roundMemorySize(freemem, 'GB'),
    ramLimitMb: _roundMemorySize(heapSizeLimit, 'MB'),
    usedRamMb: _roundMemorySize(usedHeapSize, 'MB')
  }
}

module.exports = (eol = os.EOL) => {
  const {
    provider,
    repo,
    owner
  } = appUpdateConfig
  const {
    version,
    repository = 'https://github.com'
  } = packageJson
  const {
    hash: commitHash,
    date: commitDate
  } = lastCommit

  const {
    electron: electronVersion,
    chrome: chromeVersion,
    node: nodeVersion,
    v8: v8Version
  } = process.versions

  const osType = os.type()
  const osArch = os.arch()
  const osRelease = os.release()
  const _osVersion = os.version()
  const osVersion = process.platform === 'linux'
    ? _osVersion.replace(/^#\w+[~-]/, '')
    : _osVersion
  const cpus = os.cpus()
  const cpuCount = cpus.length
  const { model: cpuModel } = { ...cpus[0] }

  const {
    totalRamGb,
    freeRamGb,
    ramLimitMb,
    usedRamMb
  } = _getRamInfo()

  const repositoryUrl = (
    provider === 'github' &&
    owner &&
    repo
  )
    ? `https://${provider}.com/${owner}/${repo}`
    : repository
  const isBfxApiStagingUsed = isBfxApiStaging()
  const bfxApiStagingDetail = isBfxApiStagingUsed
    ? `${eol}Is BFX API Staging used: Yes`
    : ''
  const isAppImageUsed = !!process.env.APPIMAGE
  const isAppImageUsedStr = isAppImageUsed
    ? 'Yes'
    : 'No'
  const linuxReleaseType = process.platform === 'linux'
    ? `${eol}Is AppImage used: ${isAppImageUsedStr}`
    : ''

  const detail = `\
Version: ${version}${eol}\
Commit Hash: ${commitHash}${eol}\
Commit Date:  ${commitDate}${eol}\
Electron: ${electronVersion}${eol}\
Chrome: ${chromeVersion}${eol}\
Node.js: ${nodeVersion}${eol}\
V8: ${v8Version}${eol}\
OS version: ${osVersion}${eol}\
OS release: ${osType} ${osArch} ${osRelease}\
${bfxApiStagingDetail}\
${linuxReleaseType}
`

  return {
    productName,
    provider,
    repo,
    owner,
    version,
    repositoryUrl,
    commitHash,
    commitDate,
    electronVersion,
    chromeVersion,
    nodeVersion,
    v8Version,
    osType,
    osArch,
    osRelease,
    osVersion,
    totalRamGb,
    freeRamGb,
    ramLimitMb,
    usedRamMb,
    cpuModel,
    cpuCount,
    isBfxApiStagingUsed,
    isAppImageUsed,
    detail
  }
}
