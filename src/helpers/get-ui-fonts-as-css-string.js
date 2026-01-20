'use strict'

const fs = require('fs')
const path = require('path')

const { rootPath } = require('./root-path')
const fontsPath = path.join(rootPath, 'bfx-report-ui/build/fonts/')
const fontsStyle = fs.readFileSync(
  path.join(fontsPath, 'inter.css'),
  'utf8'
)
const fStyleWithNormalizedPaths = fontsStyle.replace(
  /url\('\.\/(.*\..*)'\)/g,
  `url('${fontsPath}$1')`
)

module.exports = () => fStyleWithNormalizedPaths
