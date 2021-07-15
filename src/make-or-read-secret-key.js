'use strict'

const crypto = require('crypto')
const { promisify } = require('util')
const path = require('path')
const fs = require('fs')

const randomBytes = promisify(crypto.randomBytes)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)

const { WrongSecretKeyError } = require('./errors')
const { SECRET_KEY_FILE_NAME } = require('./const')
const KEY_BYTES = 256

const _generateSecretKey = async () => {
  const keyBuffer = await randomBytes(KEY_BYTES)

  return keyBuffer.toString('hex')
}

const _readSecretKey = async (secretKeyPath) => {
  try {
    const secretKey = await readFile(secretKeyPath, 'utf8')

    if (
      typeof secretKey !== 'string' ||
      secretKey.length !== 256 * 2
    ) {
      throw new WrongSecretKeyError()
    }

    return secretKey
  } catch (err) {
    // Log warning to the log file and don't start opening new github issue
    console.warn(err)

    return false
  }
}

const _writeSecretKey = (secretKeyPath, secretKey) => {
  return writeFile(secretKeyPath, secretKey, 'utf8')
}

const _rm = async (secretKeyPath) => {
  try {
    const res = await unlink(secretKeyPath)

    return res
  } catch (err) {
    // Log warning to the log file and don't start opening new github issue
    console.warn(err)
  }
}

module.exports = async ({ pathToUserData }) => {
  const secretKeyPath = path.join(
    pathToUserData,
    SECRET_KEY_FILE_NAME
  )
  const secretKeyFromFile = await _readSecretKey(secretKeyPath)

  if (secretKeyFromFile) {
    return secretKeyFromFile
  }

  await _rm(secretKeyPath)
  const newSecretKey = await _generateSecretKey()
  await _writeSecretKey(secretKeyPath, newSecretKey)

  return newSecretKey
}
