'use strict'

const electron = require('electron')
const fsPromises = require('fs/promises')
const path = require('path')

// See https://cs.chromium.org/chromium/src/net/base/net_error_list.h
const FILE_NOT_FOUND = -6

const _getPath = async (filePath) => {
  try {
    const result = await fsPromises.stat(filePath)

    if (result.isFile()) {
      return filePath
    }
    if (result.isDirectory()) {
      return _getPath(path.join(filePath, 'index.html'))
    }
  } catch (err) {}

  return false
}

module.exports = (opts) => {
  const {
    directory,
    partition,
    scheme = 'app',
    startRoute = 'index',
    isCorsEnabled = true
  } = opts ?? {}

  if (!directory) {
    throw new Error('The `directory` option is required')
  }

  const dirPath = path.resolve(
    electron.app.getAppPath(),
    directory
  )

  const handler = async (request, cd) => {
    const indexPath = path.join(dirPath, 'index.html')
    const filePath = path.join(
      dirPath,
      decodeURIComponent(new URL(request.url).pathname)
    )
    const resolvedPath = await _getPath(filePath)
    const fileExtension = path.extname(filePath)

    if (
      resolvedPath ||
      !fileExtension ||
      fileExtension === '.html' ||
      fileExtension === '.asar'
    ) {
      cd({ path: resolvedPath || indexPath })

      return
    }

    cd({ error: FILE_NOT_FOUND })
  }

  electron.protocol.registerSchemesAsPrivileged([
    {
      scheme,
      privileges: {
        standard: true,
        secure: true,
        allowServiceWorkers: true,
        supportFetchAPI: true,
        corsEnabled: isCorsEnabled
      }
    }
  ])
  electron.app.on('ready', () => {
    const session = partition
      ? electron.session.fromPartition(partition)
      : electron.session.defaultSession

    session.protocol.registerFileProtocol(scheme, handler)
  })

  return async (win) => {
    await win.loadURL(`${scheme}://${startRoute ?? dirPath}`)
  }
}
