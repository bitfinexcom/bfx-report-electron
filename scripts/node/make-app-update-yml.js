'use strict'

const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

const appDir = path.join(
  path.dirname(require.main.filename),
  '../..'
)
const {
  build: { publish }
} = require(path.join(appDir, 'package.json'))
const unpackedFolder = process.argv[2]

if (
  !publish ||
  typeof publish !== 'object' ||
  !unpackedFolder ||
  typeof unpackedFolder !== 'string'
) {
  process.exit(1)
}

const ymlName = 'app-update.yml'
const ymlPath = path.join(
  unpackedFolder,
  'resources',
  ymlName
)

const yamlStr = yaml.dump(publish, {
  lineWidth: 8000
})

fs.writeFileSync(ymlPath, yamlStr)
