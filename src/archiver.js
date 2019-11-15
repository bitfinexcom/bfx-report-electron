'use strict'

const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const yauzl = require('yauzl')

const {
  InvalidFileNameInArchiveError
} = require('./errors')

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

const unzip = (
  zipPath,
  folderPath,
  params = {}
) => {
  const { extractFiles } = { ...params }
  const extractedfileNames = []
  let isClosedByError = false

  return new Promise((resolve, reject) => {
    try {
      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err)

          return
        }

        zipfile.on('error', reject)
        zipfile.on('end', () => {
          if (isClosedByError) {
            return
          }

          resolve(extractedfileNames)
        })
        zipfile.readEntry()

        zipfile.on('entry', (entry) => {
          const { fileName } = entry
          const filePath = path.join(folderPath, fileName)
          const errorMessage = yauzl.validateFileName(fileName)

          if (/\/$/.test(fileName)) {
            zipfile.readEntry()

            return
          }
          if (
            Array.isArray(extractFiles) &&
            extractFiles.every(file => file !== fileName)
          ) {
            zipfile.readEntry()

            return
          }
          if (errorMessage) {
            isClosedByError = true
            zipfile.close()
            reject(new InvalidFileNameInArchiveError(errorMessage))

            return
          }

          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              isClosedByError = true
              zipfile.close()
              reject(err)

              return
            }

            const output = fs.createWriteStream(filePath)

            output.on('close', () => {
              extractedfileNames.push(fileName)

              zipfile.readEntry()
            })
            output.on('error', (err) => {
              isClosedByError = true
              zipfile.close()
              reject(err)
            })

            readStream.on('error', (err) => {
              isClosedByError = true
              zipfile.close()
              reject(err)
            })

            readStream.pipe(output)
          })
        })
      })
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = {
  zip,
  unzip
}
