'use strict'

const path = require('path')

const { rootPath } = require('./root-path')
const reportServiceConfig = require(path.join(
  rootPath,
  'bfx-reports-framework/config/service.report.json'
))
const pattern = /(staging)|(test)/i

module.exports = () => {
  const { restUrl } = reportServiceConfig ?? {}

  return !!(
    restUrl &&
    typeof restUrl === 'string' &&
    pattern.test(restUrl)
  )
}
