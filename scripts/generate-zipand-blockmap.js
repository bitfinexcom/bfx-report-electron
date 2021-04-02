#!/usr/bin/env node

'use strict'

const path = require('path')
const {
  execSync
} = require('child_process')
const fs = require('fs')
const yaml = require('js-yaml')
const {
  appBuilderPath
} = require('app-builder-bin')

const cwd = process.cwd()
const packageJsonPath = path.join(cwd, 'package.json')

const {
  version: APP_VERSION,
  build: { productName }
} = require(packageJsonPath)

const ARCH = 'x64'
const APP_NAME = productName.replace(/\s/g, '')
const APP_DIST_PATH = path.join(cwd, 'dist')
const appReleaseFileName = `${APP_NAME}-${APP_VERSION}-${ARCH}-mac.zip`
const APP_GENERATED_BINARY_PATH = path.join(
  APP_DIST_PATH,
  appReleaseFileName
)
const ymlPath = path.join(APP_DIST_PATH, 'latest-mac.yml')

try {
  const output = execSync(`${appBuilderPath} blockmap --input=${APP_GENERATED_BINARY_PATH} --output=${APP_GENERATED_BINARY_PATH}.blockmap --compression=gzip`)
  const { sha512, size } = JSON.parse(output)
  const ymlData = yaml.load(fs.readFileSync(ymlPath, 'utf8'))

  console.log(ymlData)

  ymlData.version = APP_VERSION
  ymlData.path = appReleaseFileName
  ymlData.sha512 = sha512
  ymlData.releaseDate = new Date().toISOString()
  ymlData.files[0].url = appReleaseFileName
  ymlData.files[0].sha512 = sha512
  ymlData.files[0].size = size

  const yamlStr = yaml.dump(ymlData)

  console.log(yamlStr)

  fs.writeFileSync(ymlPath, yamlStr, 'utf8')
  console.log('Successfully updated YAML file and configurations with blockmap')
} catch (e) {
  console.log('Error in updating YAML file and configurations with blockmap', e)
}
