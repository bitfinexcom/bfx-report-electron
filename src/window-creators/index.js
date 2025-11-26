'use strict'

const electron = require('electron')
const path = require('path')
const { URL } = require('url')

const { BrowserWindow } = electron
const isDevEnv = process.env.NODE_ENV === 'development'
const isMac = process.platform === 'darwin'

const WINDOW_NAMES = require('./window.names')
const wins = require('./windows')
const ipcs = require('../ipcs')
const serve = require('../serve')
const appStates = require('../app-states')
const windowStateKeeper = require('./window-state-keeper')
const createMenu = require('../create-menu')
const {
  showLoadingWindow,
  hideLoadingWindow,
  setParentToLoadingWindow
} = require('./change-loading-win-visibility-state')
const {
  showWindow,
  hideWindow,
  centerWindow
} = require('../helpers/manage-window')
const {
  isBfxApiStaging,
  parseEnvValToBool,
  waitPort
} = require('../helpers')
const MenuIpcChannelHandlers = require(
  './main-renderer-ipc-bridge/menu-ipc-channel-handlers'
)
const ThemeIpcChannelHandlers = require(
  './main-renderer-ipc-bridge/theme-ipc-channel-handlers'
)

const shouldLocalhostBeUsedForLoadingUIInDevMode = parseEnvValToBool(
  process.env.SHOULD_LOCALHOST_BE_USED_FOR_LOADING_UI_IN_DEV_MODE
)
const uiPort = process.env.UI_PORT ?? 3000
const showNativeTitleBar = parseEnvValToBool(
  process.env.SHOW_NATIVE_TITLE_BAR
)

const publicDir = path.join(__dirname, '../../bfx-report-ui/build')
const loadURL = serve({ directory: publicDir })

const pathToLayouts = path.join(__dirname, 'layouts')
const pathToLoadingLayout = path
  .join(pathToLayouts, 'loading-window.html')
const pathToStartupLoadingLayout = path
  .join(pathToLayouts, 'startup-loading-window.html')
const pathToAppInitErrorLayout = path
  .join(pathToLayouts, 'app-init-error.html')
const pathToModalLayout = path
  .join(pathToLayouts, 'modal-window.html')

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

const _loadUI = async (params) => {
  const {
    winName,
    pathname
  } = params ?? {}

  if (
    !pathname &&
    isDevEnv &&
    shouldLocalhostBeUsedForLoadingUIInDevMode
  ) {
    const uiHost = 'localhost'
    await waitPort({ host: uiHost, port: uiPort })

    return wins[winName].loadURL(`http://${uiHost}:${uiPort}`)
  }
  if (pathname) {
    return wins[winName].loadURL(_getFileURL({ pathname }))
  }

  return loadURL(wins[winName])
}

const _createWindow = async (
  params,
  winProps
) => {
  const {
    pathname = null,
    winName = WINDOW_NAMES.MAIN_WINDOW,
    didFinishLoadHook
  } = params ?? {}

  const point = electron.screen.getCursorScreenPoint()
  const {
    bounds,
    workAreaSize
  } = electron.screen.getDisplayNearestPoint(point)
  const {
    width: defaultWidth,
    height: defaultHeight
  } = workAreaSize
  const isMainWindow = winName === WINDOW_NAMES.MAIN_WINDOW
  const {
    width = defaultWidth,
    height = defaultHeight,
    x,
    y,
    isMaximized,
    isFullScreen,
    manage
  } = isMainWindow
    ? windowStateKeeper({
      defaultWidth,
      defaultHeight
    })
    : {}
  const props = {
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
    icon: path.join(__dirname, '../../build/icons/512x512.png'),
    backgroundColor: ThemeIpcChannelHandlers.getWindowBackgroundColor(),
    show: false,
    ...winProps,

    webPreferences: {
      preload: path.join(__dirname, 'main-renderer-ipc-bridge/preload.js'),
      ...winProps?.webPreferences
    }
  }

  wins[winName] = new BrowserWindow(props)

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
  const didFinishLoadPromise = _loadUI({ winName, pathname })

  await Promise.all([
    isReadyToShowPromise,
    didFinishLoadPromise
  ])

  if (typeof didFinishLoadHook === 'function') {
    await didFinishLoadHook()
  }

  const res = {
    isMaximized,
    isFullScreen,
    isMainWindow,
    manage,
    win: wins[winName]
  }

  if (isMainWindow) {
    await showLoadingWindow({
      shouldCloseBtnBeShown: true,
      shouldMinimizeBtnBeShown: true,
      noParent: true,
      windowName: WINDOW_NAMES.STARTUP_LOADING_WINDOW
    })
    wins[WINDOW_NAMES.STARTUP_LOADING_WINDOW].setAlwaysOnTop(true)

    return res
  }
  if (props.center) {
    centerWindow(wins[winName])
  }
  if (winName === WINDOW_NAMES.STARTUP_LOADING_WINDOW) {
    setParentToLoadingWindow({
      windowName: WINDOW_NAMES.STARTUP_LOADING_WINDOW
    })
  }

  await showWindow(wins[winName])

  return res
}

const _createChildWindow = async (
  params,
  opts
) => {
  const {
    pathname,
    winName,
    didFinishLoadHook
  } = params ?? {}
  const {
    width = 500,
    height = 500,
    noParent
  } = opts ?? {}

  const point = electron.screen.getCursorScreenPoint()
  const { bounds } = electron.screen.getDisplayNearestPoint(point)
  const x = Math.ceil(bounds.x + ((bounds.width - width) / 2))
  const y = Math.ceil(bounds.y + ((bounds.height - height) / 2))

  const winProps = await _createWindow(
    {
      pathname,
      winName,
      didFinishLoadHook
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
      parent: (
        isMac ||
        noParent
      )
        ? null
        : wins[WINDOW_NAMES.MAIN_WINDOW],
      alwaysOnTop: isMac,

      ...opts
    }
  )

  winProps.win.on('closed', () => {
    if (wins.mainWindow) {
      wins[WINDOW_NAMES.MAIN_WINDOW].close()
    }

    wins[WINDOW_NAMES.MAIN_WINDOW] = null
  })

  return winProps
}

const createMainWindow = async ({
  pathToUserData,
  pathToUserDocuments
}) => {
  const titleBarOverlayOpt = isMac
    ? { titleBarOverlay: { height: 26 } }
    : {
        titleBarOverlay: {
          height: 40,
          color: ThemeIpcChannelHandlers.getWindowTitleBackgroundColor(),
          symbolColor: ThemeIpcChannelHandlers.getWindowTitleBackgroundColor(
            { isSymbolColor: true }
          )
        }
      }
  const titleBarOpts = showNativeTitleBar
    ? {}
    : {
        titleBarStyle: 'hidden',
        ...titleBarOverlayOpt
      }
  const winProps = await _createWindow(null, titleBarOpts)
  const {
    win,
    manage,
    isMaximized,
    isFullScreen
  } = winProps

  win.on('closed', () => {
    if (
      wins[WINDOW_NAMES.LOADING_WINDOW] &&
      typeof wins[WINDOW_NAMES.LOADING_WINDOW] === 'object' &&
      !wins[WINDOW_NAMES.LOADING_WINDOW].isDestroyed()
    ) {
      wins[WINDOW_NAMES.LOADING_WINDOW].close()
    }
    if (
      wins[WINDOW_NAMES.STARTUP_LOADING_WINDOW] &&
      typeof wins[WINDOW_NAMES.STARTUP_LOADING_WINDOW] === 'object' &&
      !wins[WINDOW_NAMES.STARTUP_LOADING_WINDOW].isDestroyed()
    ) {
      wins[WINDOW_NAMES.STARTUP_LOADING_WINDOW].close()
    }

    wins[WINDOW_NAMES.LOADING_WINDOW] = null
    wins[WINDOW_NAMES.STARTUP_LOADING_WINDOW] = null
  })

  if (
    !showNativeTitleBar &&
    isMac
  ) {
    win.on('enter-full-screen', () => {
      MenuIpcChannelHandlers
        .sendHideMenuEvent(win, { state: true })
    })
    win.on('leave-full-screen', () => {
      MenuIpcChannelHandlers
        .sendHideMenuEvent(win, { state: false })
    })
  }

  if (isDevEnv) {
    wins[WINDOW_NAMES.MAIN_WINDOW].webContents
      .openDevTools({ mode: 'right' })
  }
  if (isBfxApiStaging()) {
    const title = wins[WINDOW_NAMES.MAIN_WINDOW].getTitle()

    wins[WINDOW_NAMES.MAIN_WINDOW]
      .setTitle(`${title} - BFX API STAGING USED`)
  }

  createMenu({ pathToUserData, pathToUserDocuments })

  appStates.isMainWinMaximized = isMaximized
  appStates.isMainWinFullScreen = isFullScreen

  manage(win)

  return winProps
}

const createLoadingWindow = async () => {
  const winProps = await _createChildWindow(
    {
      pathname: pathToLoadingLayout,
      winName: WINDOW_NAMES.LOADING_WINDOW
    },
    {
      width: 350,
      height: 350,
      maximizable: false,
      fullscreenable: false,
      parent: wins[WINDOW_NAMES.MAIN_WINDOW],
      modal: true
    }
  )

  return winProps
}

const createStartupLoadingWindow = async () => {
  const winProps = await _createChildWindow(
    {
      pathname: pathToStartupLoadingLayout,
      winName: WINDOW_NAMES.STARTUP_LOADING_WINDOW
    },
    {
      width: 350,
      height: 350,
      maximizable: false,
      fullscreenable: false,
      noParent: true
    }
  )

  return winProps
}

const createModalWindow = async (args) => {
  const parentWin = (
    !wins?.[WINDOW_NAMES.MAIN_WINDOW] ||
    wins[WINDOW_NAMES.MAIN_WINDOW].isDestroyed()
  )
    ? null
    : wins[WINDOW_NAMES.MAIN_WINDOW]

  const winProps = await _createChildWindow(
    {
      pathname: pathToModalLayout,
      winName: WINDOW_NAMES.MODAL_WINDOW,
      didFinishLoadHook: async () => {} // TODO:
    },
    {
      width: null,
      height: null,
      minWidth: 500,
      minHeight: 500,
      maximizable: false,
      fullscreenable: false,
      parent: parentWin,
      modal: !!parentWin
    }
  )

  return winProps
}

const createErrorWindow = async () => {
  const winProps = await _createChildWindow(
    {
      pathname: pathToAppInitErrorLayout,
      winName: WINDOW_NAMES.ERROR_WINDOW
    },
    {
      height: 300,
      frame: false
    }
  )

  await hideLoadingWindow({ windowName: WINDOW_NAMES.LOADING_WINDOW })
  await hideLoadingWindow({ windowName: WINDOW_NAMES.STARTUP_LOADING_WINDOW })
  await hideWindow(wins[WINDOW_NAMES.MAIN_WINDOW])

  return winProps
}

module.exports = {
  createMainWindow,
  createErrorWindow,
  createLoadingWindow,
  createStartupLoadingWindow,
  createModalWindow
}
