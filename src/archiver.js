'use strict'

const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const yauzl = require('yauzl')

const {
  InvalidFileNameInArchiveError
} = require('./errors')

const getTotalFilesStats = async (filePaths) => {
  const promises = filePaths.map((filePath) => {
    return fs.promises.stat(filePath)
  })
  const stats = await Promise.all(promises)
  const size = stats.reduce((size, stat) => {
    return Number.isFinite(stat?.size)
      ? size + stat.size
      : size
  }, 0)

  return {
    size,
    stats
  }
}

const bytesToSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  if (bytes <= 0) {
    return '0 Byte'
  }

  const i = Number.parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  const val = Math.round(bytes / Math.pow(1024, i), 2)
  const size = sizes[i]

  return `${val} ${size}`
}

const zip = async (
  zipPath,
  filePaths,
  params
) => {
  const _filePaths = Array.isArray(filePaths)
    ? filePaths
    : [filePaths]
  const {
    size,
    stats
  } = await getTotalFilesStats(_filePaths)

  return new Promise((_resolve, _reject) => {
    let interval = null
    const resolve = (...args) => {
      clearInterval(interval)
      return _resolve(...args)
    }
    const reject = (err) => {
      clearInterval(interval)
      return _reject(err)
    }

    try {
      const {
        zlib,
        progressHandler
      } = params ?? {}
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

      if (typeof progressHandler === 'function') {
        let processedBytes = 0

        const asyncProgressHandler = async () => {
          try {
            if (
              !Number.isFinite(size) ||
              size === 0 ||
              !Number.isFinite(processedBytes)
            ) {
              return
            }

            const progress = processedBytes / size
            const archiveBytes = archive.pointer()
            const prettyArchiveSize = bytesToSize(archiveBytes)

            await progressHandler({
              progress,
              archiveBytes,
              prettyArchiveSize
            })
          } catch (err) {
            console.debug(err)
          }
        }

        archive.on('progress', async (e) => {
          processedBytes = e.fs.processedBytes ?? 0
          await asyncProgressHandler()
        })
        interval = setInterval(asyncProgressHandler, 3000)
      }

      archive.pipe(output)

      for (const [i, filePath] of _filePaths.entries()) {
        const readStream = fs.createReadStream(filePath)
        const name = path.basename(filePath)

        readStream.on('error', reject)

        archive.append(readStream, { name, stats: stats[i] })
      }

      archive.finalize()
    } catch (err) {
      reject(err)
    }
  })
}

const unzip = (
  zipPath,
  folderPath,
  params
) => {
  const {
    extractFiles,
    progressHandler
  } = params ?? {}
  return new Promise((_resolve, _reject) => {
    const entryStates = []
    let totalUncompressedSize = 0
    let unzippedBytes = 0
    let lastProgressEventMts = Date.now()

    const asyncProgressHandler = async () => {
      try {
        if (typeof progressHandler !== 'function') {
          return
        }

        if (
          !Number.isFinite(totalUncompressedSize) ||
          totalUncompressedSize === 0 ||
          !Number.isFinite(unzippedBytes)
        ) {
          return
        }

        const progress = unzippedBytes / totalUncompressedSize
        const prettyUnzippedBytes = bytesToSize(unzippedBytes)

        await progressHandler({
          progress,
          unzippedBytes,
          prettyUnzippedBytes
        })
      } catch (err) {
        console.debug(err)
      }
    }
    const resolve = (entryState) => {
      if (entryState) {
        entryState.isClosedSuccessfully = true
      }
      if (
        entryStates.some((state) => state?.isClosedWithError) ||
        entryStates.some((state) => !state?.isClosedSuccessfully)
      ) {
        return
      }

      asyncProgressHandler()

      return _resolve(entryStates.map((state) => state?.entry?.fileName))
    }
    const reject = (err, zipfile, entryState) => {
      if (entryState) {
        entryState.isClosedWithError = true
      }
      if (zipfile) {
        zipfile.close()
      }

      return _reject(err)
    }

    try {
      yauzl.open(zipPath, { lazyEntries: false }, (err, zipfile) => {
        if (err) {
          reject(err)

          return
        }

        zipfile.on('error', reject)
        zipfile.on('end', () => resolve())
        zipfile.on('entry', (entry) => {
          const { fileName } = entry
          const filePath = path.join(folderPath, fileName)
          const errorMessage = yauzl.validateFileName(fileName)

          if (/\/$/.test(fileName)) {
            return
          }
          if (
            Array.isArray(extractFiles) &&
            extractFiles.every(file => file !== fileName)
          ) {
            return
          }

          const entryState = {
            isClosedWithError: false,
            isClosedSuccessfully: false,
            entry
          }
          totalUncompressedSize += entry?.uncompressedSize ?? 0
          entryStates.push(entryState)

          if (errorMessage) {
            reject(
              new InvalidFileNameInArchiveError(errorMessage),
              zipfile,
              entryState
            )

            return
          }

          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              reject(err, zipfile, entryState)

              return
            }

            const output = fs.createWriteStream(filePath)

            output.on('close', () => resolve(entryState))
            output.on('error', (err) => {
              reject(err, zipfile, entryState)
            })

            readStream.on('error', (err) => {
              reject(err, zipfile, entryState)
            })
            readStream.on('data', (chunk) => {
              unzippedBytes += chunk.length
              const currMts = Date.now()

              if (currMts - lastProgressEventMts < 500) {
                return
              }

              lastProgressEventMts = currMts
              asyncProgressHandler()
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
