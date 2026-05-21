'use strict'

const { app, protocol, net } = require('electron')
const path = require('node:path')
const {
  createReadStream,
  promises: {
    stat
  }
} = require('node:fs')

const {
  waitPort,
  parseEnvValToBool,
  envIdentifiers: {
    IS_DEV
  }
} = require('../helpers')
const { rootPath } = require('../helpers/root-path')

const shouldLocalhostBeUsedForLoadingUIInDevMode = parseEnvValToBool(
  process.env.SHOULD_LOCALHOST_BE_USED_FOR_LOADING_UI_IN_DEV_MODE
)
const uiPort = process.env.UI_PORT ?? 3000

const SCHEME_NAME = 'app'
const HOSTS = {
  REACT: 'react',
  STATIC: 'static'
}
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/vnd.microsoft.icon',
  '.json': 'application/json'
}
const STATIC_PUB_DIR_REGISTER_IN_ROOT = {
  UI_SUB_MODULE_STATICS: 'bfx-report-ui/build',
  ELECTRON_STATICS: 'build',
  GH_MARKDOWN_STYLES: 'node_modules/github-markdown-css',
  WIN_LAYOUTS: 'src/window-creators/layouts'
}
const STATIC_PUB_DIR_SET_IN_ROOT = Object.values(
  STATIC_PUB_DIR_REGISTER_IN_ROOT
)

const reactUIPubDir = path.join(
  rootPath,
  STATIC_PUB_DIR_REGISTER_IN_ROOT.UI_SUB_MODULE_STATICS
)
const winLayoutsPubDir = path.join(
  rootPath,
  STATIC_PUB_DIR_REGISTER_IN_ROOT.WIN_LAYOUTS
)

protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME_NAME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
])

const isPubDirAllowedInRootForStaticHost = (path) => {
  return STATIC_PUB_DIR_SET_IN_ROOT.some((dir) => (
    path.startsWith(dir)
  ))
}

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase()

  return MIME_TYPES[ext] ?? 'application/octet-stream'
}

const getFilePath = async (parsedUrl) => {
  const relativePath = parsedUrl.pathname.replace(/^\/+/, '')

  if (relativePath.includes('..')) {
    return
  }
  if (parsedUrl.host === HOSTS.REACT) {
    const filePath = path.join(reactUIPubDir, relativePath)
    const stats = await stat(filePath)
    const hasNoExtension = !path.extname(filePath)

    if (
      !stats.isFile() ||
      hasNoExtension
    ) {
      return path.join(reactUIPubDir, 'index.html')
    }

    return filePath
  }
  if (parsedUrl.host !== HOSTS.STATIC) {
    return
  }
  if (isPubDirAllowedInRootForStaticHost(relativePath)) {
    return path.join(rootPath, relativePath)
  }

  return path.join(winLayoutsPubDir, relativePath)
}

const handleAppProtocol = async () => {
  await app.whenReady()

  protocol.handle(SCHEME_NAME, async (request) => {
    // parsedUrl.host === 'react' or 'static' (from URL like app://react/..)
    const parsedUrl = new URL(request.url)

    if (
      parsedUrl.host === HOSTS.REACT &&
      IS_DEV &&
      shouldLocalhostBeUsedForLoadingUIInDevMode
    ) {
      const uiHost = 'localhost'
      const devServerUrl = `http://${uiHost}:${uiPort}${parsedUrl.pathname}${parsedUrl.search}`
      await waitPort({ host: uiHost, port: uiPort })

      try {
        return await net.fetch(devServerUrl, {
          method: request.method,
          headers: request.headers,
          body: request.body
        })
      } catch (err) {
        return new Response('DevServer Error', { status: 502 })
      }
    }

    try {
      const filePath = await getFilePath(parsedUrl)
      const stats = await stat(filePath)

      if (!stats.isFile()) {
        return new Response('Not Found', { status: 404 })
      }

      const fileStream = createReadStream(filePath)
      const mimeType = getMimeType(filePath)

      return new Response(fileStream, {
        status: 200,
        headers: { 'content-type': mimeType }
      })
    } catch (error) {
      return new Response('Internal Error', { status: 500 })
    }
  })

  return async (win, params) => {
    const host = params?.host ?? HOSTS.REACT
    const layout = params?.layout ?? ''
    const url = `${SCHEME_NAME}://${host}/${layout}`

    await win.loadURL(url)
  }
}

module.exports = {
  HOSTS,
  handleAppProtocol
}
