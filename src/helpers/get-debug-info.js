'use strict'

const { rootPath: appDir } = require('electron-root-path')
const path = require('path')
const os = require('os')

const productName = 'Bitfinex Report'

const { getAppUpdateConfigSync } = require('../auto-updater')

const appUpdateConfig = getAppUpdateConfigSync()
const packageJson = require(path.join(appDir, 'package.json'))

let lastCommit = { hash: '-', date: '-' }

try {
  lastCommit = require(path.join(appDir, 'lastCommit.json'))
} catch (err) {
  console.error(err)
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

  const repositoryUrl = (
    provider === 'github' &&
    owner &&
    repo
  )
    ? `https://${provider}.com/${owner}/${repo}`
    : repository

  const detail = `\
Version: ${version}${eol}\
Commit Hash: ${commitHash}${eol}\
Commit Date:  ${commitDate}${eol}\
Electron: ${electronVersion}${eol}\
Chrome: ${chromeVersion}${eol}\
Node.js: ${nodeVersion}${eol}\
V8: ${v8Version}${eol}\
OS: ${osType} ${osArch} ${osRelease}\
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
    detail
  }
}
