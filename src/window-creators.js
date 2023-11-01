'use strict'

const electron = require('electron')
const path = require('path')
const { URL } = require('url')

const { BrowserWindow } = electron
const isDevEnv = process.env.NODE_ENV === 'development'
const isTestEnv = process.env.NODE_ENV === 'test'
const isMac = process.platform === 'darwin'

const wins = require('./windows')
const ipcs = require('./ipcs')
const serve = require('./serve')
const appStates = require('./app-states')
const windowStateKeeper = require('./window-state-keeper')
const createMenu = require('./create-menu')
const {
  showLoadingWindow,
  hideLoadingWindow
} = require('./change-loading-win-visibility-state')
const {
  showWindow,
  hideWindow,
  centerWindow
} = require('./helpers/manage-window')
const isBfxApiStaging = require('./helpers/is-bfx-api-staging')

const publicDir = path.join(__dirname, '../bfx-report-ui/build')
const loadURL = serve({ directory: publicDir })

const pathToLayouts = path.join(__dirname, 'layouts')
const pathToLayoutAppInit = path.join(pathToLayouts, 'app-init.html')

const _getFileURL = (params) => {
  const {
    protocol = 'file',
    hostname = '',
    pathname = ''
  } = params ?? {}

  const fileURL = new URL('file://./')

  fileURL.protocol = protocol
  fileURL.hostname = hostname
  fileURL.pathname = pathname

  return fileURL.toString()
}

const _createWindow = async (
  {
    pathname = null,
    winName = 'mainWindow'
  } = {},
  props = {}
) => {
  const point = electron.screen.getCursorScreenPoint()
  const {
    bounds,
    workAreaSize
  } = electron.screen.getDisplayNearestPoint(point)
  const {
    width: defaultWidth,
    height: defaultHeight
  } = workAreaSize
  const isMainWindow = winName === 'mainWindow'
  const isLoadingWindow = winName === 'loadingWindow'
  const {
    width = defaultWidth,
    height = defaultHeight,
    x,
    y,
    isMaximized,
    manage
  } = isMainWindow
    ? windowStateKeeper({
        defaultWidth,
        defaultHeight
      })
    : {}
  const _props = {
    autoHideMenuBar: true,
    width,
    height,
    minWidth: 1000,
    minHeight: 650,
    x: !x
      ? bounds.x
      : x,
    y: !y
      ? bounds.y
      : y,
    icon: path.join(__dirname, '../build/icons/512x512.png'),
    backgroundColor: '#172d3e',
    show: false,
    ...props,

    webPreferences: {
      sandbox: !isTestEnv,
      preload: path.join(__dirname, 'preload.js'),
      ...props?.webPreferences
    }
  }

  wins[winName] = new BrowserWindow(_props)

  wins[winName].on('closed', () => {
    wins[winName] = null

    if (
      ipcs.serverIpc &&
      typeof ipcs.serverIpc === 'object'
    ) {
      ipcs.serverIpc.kill('SIGINT')
    }
  })

  const isReadyToShowPromise = new Promise((resolve) => {
    wins[winName].once('ready-to-show', resolve)
  })
  const didFinishLoadPromise = pathname
    ? wins[winName].loadURL(_getFileURL({ pathname }))
    : loadURL(wins[winName])

  await Promise.all([
    isReadyToShowPromise,
    didFinishLoadPromise
  ])

  const res = {
    isMaximized,
    isMainWindow,
    manage,
    win: wins[winName]
  }

  if (!pathname) {
    const props = await createLoadingWindow()
    props.win.setAlwaysOnTop(true)

    return res
  }
  if (_props.center) {
    centerWindow(wins[winName])
  }

  await showWindow(
    wins[winName],
    { shouldWinBeShownInactive: isLoadingWindow }
  )

  return res
}

const _createChildWindow = async (
  pathname,
  winName,
  opts = {}
) => {
  const {
    width = 500,
    height = 500
  } = { ...opts }

  const point = electron.screen.getCursorScreenPoint()
  const { bounds } = electron.screen.getDisplayNearestPoint(point)
  const x = Math.ceil(bounds.x + ((bounds.width - width) / 2))
  const y = Math.ceil(bounds.y + ((bounds.height - height) / 2))

  const winProps = await _createWindow(
    {
      pathname,
      winName
    },
    {
      width,
      height,
      minWidth: width,
      minHeight: height,
      x,
      y,
      resizable: false,
      center: true,
      frame: false,

      // TODO: The reason for it related to the electronjs issue:
      // `[Bug]: Wrong main window hidden state on macOS when using 'parent' option`
      // https://github.com/electron/electron/issues/29732
      parent: isMac ? null : wins.mainWindow,
      alwaysOnTop: isMac,

      ...opts
    }
  )

  winProps.win.on('closed', () => {
    if (wins.mainWindow) {
      wins.mainWindow.close()
    }

    wins.mainWindow = null
  })

  return winProps
}

const createMainWindow = async ({
  pathToUserData,
  pathToUserDocuments
}) => {
  const winProps = await _createWindow()
  const {
    win,
    manage,
    isMaximized
  } = winProps

  win.on('closed', () => {
    if (
      wins.loadingWindow &&
      typeof wins.loadingWindow === 'object' &&
      !wins.loadingWindow.isDestroyed()
    ) {
      wins.loadingWindow.close()
    }

    wins.loadingWindow = null
  })

  if (isDevEnv) {
    wins.mainWindow.webContents.openDevTools()
  }
  if (isBfxApiStaging()) {
    const title = wins.mainWindow.getTitle()

    wins.mainWindow.setTitle(`${title} - BFX API STAGING USED`)
  }

  createMenu({ pathToUserData, pathToUserDocuments })

  appStates.isMainWinMaximized = isMaximized

  manage(win)

  return winProps
}

const createLoadingWindow = async () => {
  if (
    wins.loadingWindow &&
    typeof wins.loadingWindow === 'object' &&
    !wins.loadingWindow.isDestroyed() &&
    !wins.loadingWindow.isVisible()
  ) {
    await showLoadingWindow()

    return {}
  }

  const winProps = await _createChildWindow(
    pathToLayoutAppInit,
    'loadingWindow',
    {
      width: 350,
      height: 350,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    }
  )

  return winProps
}

const createErrorWindow = async (pathname) => {
  const winProps = await _createChildWindow(
    pathname,
    'errorWindow',
    {
      height: 200,
      frame: true
    }
  )

  await hideLoadingWindow()
  await hideWindow(wins.mainWindow)

  return winProps
}

module.exports = {
  createMainWindow,
  createErrorWindow,
  createLoadingWindow
}
