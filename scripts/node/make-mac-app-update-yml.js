'use strict'

const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

const cwd = process.cwd()
const {
  publish
} = require(path.join(cwd, 'electron-builder-config'))

if (
  !publish ||
  typeof publish !== 'object'
) {
  process.exit(1)
}

const ymlName = 'app-update.yml'
const ymlPath = path.join(
  cwd,
  'dist/mac/bfx-report-electron.app/Contents/Resources',
  ymlName
)

const yamlStr = yaml.dump(publish, { lineWidth: -1 })

fs.writeFileSync(ymlPath, yamlStr)
