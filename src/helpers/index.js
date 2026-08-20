'use strict'

const {
  getFreePort
} = require('./ports')
const {
  serializeError,
  deserializeError,
  rm,
  getServerPromise
} = require('./utils')
const isMainWinAvailable = require(
  './is-main-win-available'
)
const productName = require('./product-name')
const getAlertCustomClassObj = require('./get-alert-custom-class-obj')
const parseEnvValToBool = require('./parse-env-val-to-bool')
const isBfxApiStaging = require('./is-bfx-api-staging')
const waitPort = require('./wait-port')
const manageConfigs = require('./manage-configs')
const platformIdentifiers = require('./platform-identifiers')
const envIdentifiers = require('./env-identifiers')
const isWaylandSession = require('./is-wayland-session')
const forceX11OnWayland = require('./force-x11-on-wayland')
const migrateDbFilesToSandboxOnMacOS = require('./migrate-db-files-to-sandbox-on-macos')
const openExternalUrl = require('./open-external-url')

module.exports = {
  getFreePort,
  serializeError,
  deserializeError,
  rm,
  getServerPromise,
  isMainWinAvailable,
  productName,
  getAlertCustomClassObj,
  parseEnvValToBool,
  isBfxApiStaging,
  waitPort,
  manageConfigs,
  platformIdentifiers,
  envIdentifiers,
  isWaylandSession,
  forceX11OnWayland,
  migrateDbFilesToSandboxOnMacOS,
  openExternalUrl
}
