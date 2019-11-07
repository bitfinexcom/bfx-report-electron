'use strict'

const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

const zip = (
  zipPath,
  filePaths = [],
  params = {}
) => {
  return new Promise((resolve, reject) => {
    try {
      const _filePaths = Array.isArray(filePaths)
        ? filePaths
        : [filePaths]
      const { zlib } = { ...params }
      const _params = {
        ...params,
        zlib: {
          level: 9,
          ...zlib
        }
      }

      const output = fs.createWriteStream(zipPath)
      const archive = archiver('zip', _params)

      output.on('close', resolve)
      output.on('error', reject)
      archive.on('error', reject)
      archive.on('warning', reject)

      archive.pipe(output)

      _filePaths.forEach((file) => {
        const readStream = fs.createReadStream(file)
        const name = path.basename(file)

        readStream.on('error', reject)

        archive.append(readStream, { name })
      })

      archive.finalize()
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = {
  zip
}
