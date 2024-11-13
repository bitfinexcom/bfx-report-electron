'use strict'

const { rootPath } = require('electron-root-path')
const fs = require('fs')
const path = require('path')

const fontsPath = path.join(rootPath, 'bfx-report-ui/build/fonts/')
const fontsStyle = fs.readFileSync(
  path.join(fontsPath, 'roboto.css'),
  'utf8'
)
const fStyleWithNormalizedPaths = fontsStyle.replace(
  /url\(\.\/(.*\..*)\)/g,
  `url(${fontsPath}$1)`
)

module.exports = () => fStyleWithNormalizedPaths
