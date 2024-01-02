'use strict'

const path = require('path')
const {
  readFileSync,
  writeFileSync
} = require('fs')

const cwd = process.cwd()
const fileName = process.argv[2]
const filePath = path.join(cwd, fileName)

const content = readFileSync(filePath, { encoding: 'utf8' })
/*
 * For compatibility with the dorny/test-reporter,
 * there needs to be 'time' attribute to '<testsuites>' tag
 */
const normalizedContent = content
  .replace(/<testsuites>/gi, '<testsuites time="0">')
writeFileSync(filePath, normalizedContent)
