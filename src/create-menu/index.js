'use strict'

const electron = require('electron')
const i18next = require('i18next')

const { app, Menu } = electron
const isMac = process.platform === 'darwin'

const exportDB = require('../export-db')
const importDB = require('../import-db')
const removeDB = require('../remove-db')
const restoreDB = require('../restore-db')
const backupDB = require('../backup-db')
const changeReportsFolder = require('../change-reports-folder')
const changeSyncFrequency = require('../change-sync-frequency')
const triggerElectronLoad = require('../trigger-electron-load')
const showAboutModalDialog = require('../show-about-modal-dialog')
const {
  checkForUpdates,
  quitAndInstall
} = require('../auto-updater')
const { manageNewGithubIssue } = require('../error-manager')
const showDocs = require('../show-docs')
const { showChangelog } = require('../changelog-manager')
const parseEnvValToBool = require('../helpers/parse-env-val-to-bool')
const isMainWinAvailable = require('../helpers/is-main-win-available')
const wins = require('../window-creators/windows')

const MENU_ITEM_IDS = require('./menu.item.ids')
const MENU_ITEM_ACCELERATORS = require('./menu.item.accelerators')

const isAutoUpdateDisabled = parseEnvValToBool(process.env.IS_AUTO_UPDATE_DISABLED)

let pathToUserData = null
let pathToUserDocuments = null
let isMenuInitialized = false

const _getPrevMenuItemPropsById = (id, params) => {
  const paramsArr = Array.isArray(params)
    ? params
    : [params]
  const res = {}

  for (const opts of paramsArr) {
    const {
      propName,
      defaultVal = true
    } = opts ?? {}

    if (!propName) {
      continue
    }
    if (
      !id ||
      !isMenuInitialized
    ) {
      res[propName] = defaultVal

      continue
    }

    const prevMenu = Menu.getApplicationMenu()
    const menuItem = prevMenu?.getMenuItemById?.(id)

    res[propName] = menuItem?.[propName] ?? defaultVal
  }

  return res
}

module.exports = (params) => {
  pathToUserData = params?.pathToUserData ?? pathToUserData
  pathToUserDocuments = params?.pathToUserDocuments ?? pathToUserDocuments

  if (
    !pathToUserData ||
    !pathToUserDocuments
  ) {
    return
  }

  const menuTemplate = [
    ...(isMac
      ? [{
          role: 'appMenu',
          label: app.name,
          submenu: [
            {
              label: i18next.t(
                'menu.helpSubMenu.aboutLabel',
                { appName: app.name }
              ),
              id: MENU_ITEM_IDS.MAC_ABOUT_MENU_ITEM,
              accelerator: MENU_ITEM_ACCELERATORS.ABOUT_MENU_ITEM,
              click: showAboutModalDialog()
            },
            { type: 'separator' },
            {
              role: 'services',
              label: i18next.t('menu.macMainSubmenu.servicesLabel')
            },
            { type: 'separator' },
            {
              role: 'hide',
              label: i18next.t('menu.macMainSubmenu.hideLabel'),
              id: MENU_ITEM_IDS.MAC_HIDE_MENU_ITEM,
              accelerator: MENU_ITEM_ACCELERATORS.MAC_HIDE_MENU_ITEM
            },
            {
              role: 'hideOthers',
              label: i18next.t('menu.macMainSubmenu.hideOthersLabel'),
              id: MENU_ITEM_IDS.MAC_HIDE_OTHERS_MENU_ITEM,
              accelerator: MENU_ITEM_ACCELERATORS.MAC_HIDE_OTHERS_MENU_ITEM
            },
            {
              role: 'unhide',
              label: i18next.t('menu.macMainSubmenu.unhideLabel'),
              id: MENU_ITEM_IDS.MAC_UNHIDE_MENU_ITEM
            },
            { type: 'separator' },
            {
              role: 'quit',
              label: i18next.t('menu.macMainSubmenu.quitLabel'),
              id: MENU_ITEM_IDS.MAC_QUIT_MENU_ITEM,
              accelerator: MENU_ITEM_ACCELERATORS.QUIT_MENU_ITEM
            }
          ]
        }]
      : []),
    {
      role: 'fileMenu',
      label: i18next.t('menu.fileSubMenu.label'),
      submenu: [
        isMac
          ? {
              role: 'close',
              label: i18next.t('menu.fileSubMenu.closeLabel'),
              id: MENU_ITEM_IDS.MAC_CLOSE_MENU_ITEM,
              accelerator: MENU_ITEM_ACCELERATORS.CLOSE_MENU_ITEM
            }
          : {
              role: 'quit',
              label: i18next.t('menu.fileSubMenu.quitLabel'),
              id: MENU_ITEM_IDS.QUIT_MENU_ITEM,
              accelerator: MENU_ITEM_ACCELERATORS.QUIT_MENU_ITEM
            }
      ]
    },
    {
      role: 'editMenu',
      label: i18next.t('menu.editSubMenu.label'),
      submenu: [
        {
          role: 'undo',
          label: i18next.t('menu.editSubMenu.undoLabel'),
          id: MENU_ITEM_IDS.UNDO_MENU_ITEM,
          accelerator: MENU_ITEM_ACCELERATORS.UNDO_MENU_ITEM
        },
        {
          role: 'redo',
          label: i18next.t('menu.editSubMenu.redoLabel'),
          id: MENU_ITEM_IDS.REDO_MENU_ITEM,
          accelerator: MENU_ITEM_ACCELERATORS.REDO_MENU_ITEM
        },
        { type: 'separator' },
        {
          role: 'cut',
          label: i18next.t('menu.editSubMenu.cutLabel'),
          id: MENU_ITEM_IDS.CUT_MENU_ITEM,
          accelerator: MENU_ITEM_ACCELERATORS.CUT_MENU_ITEM
        },
        {
          role: 'copy',
          label: i18next.t('menu.editSubMenu.copyLabel'),
          id: MENU_ITEM_IDS.COPY_MENU_ITEM,
          accelerator: MENU_ITEM_ACCELERATORS.COPY_MENU_ITEM
        },
        {
          role: 'paste',
          label: i18next.t('menu.editSubMenu.pasteLabel'),
          id: MENU_ITEM_IDS.PASTE_MENU_ITEM,
          accelerator: MENU_ITEM_ACCELERATORS.PASTE_MENU_ITEM
        },
        ...(isMac
          ? [
              {
                role: 'pasteAndMatchStyle',
                label: i18next.t('menu.editSubMenu.pasteAndMatchStyleLabel'),
                id: MENU_ITEM_IDS.MAC_PASTE_AND_MATCH_STYLE_MENU_ITEM,
                accelerator: MENU_ITEM_ACCELERATORS.MAC_PASTE_AND_MATCH_STYLE_MENU_ITEM
              },
              {
                role: 'delete',
                label: i18next.t('menu.editSubMenu.deleteLabel'),
                id: MENU_ITEM_IDS.DELETE_MENU_ITEM
              },
              {
                role: 'selectAll',
                label: i18next.t('menu.editSubMenu.selectAllLabel'),
                id: MENU_ITEM_IDS.SELECT_ALL_MENU_ITEM,
                accelerator: MENU_ITEM_ACCELERATORS.SELECT_ALL_MENU_ITEM
              },
              { type: 'separator' },
              {
                label: i18next.t('menu.editSubMenu.substitutionsSubMenu.label'),
                submenu: [
                  {
                    role: 'showSubstitutions',
                    label: i18next.t('menu.editSubMenu.substitutionsSubMenu.showSubstitutions'),
                    id: MENU_ITEM_IDS.MAC_SHOW_SUBSTITUTIONS
                  },
                  {
                    role: 'toggleSmartQuotes',
                    label: i18next.t('menu.editSubMenu.substitutionsSubMenu.toggleSmartQuotes'),
                    id: MENU_ITEM_IDS.MAC_TOGGLE_SMART_QUOTES
                  },
                  {
                    role: 'toggleSmartDashes',
                    label: i18next.t('menu.editSubMenu.substitutionsSubMenu.toggleSmartDashes'),
                    id: MENU_ITEM_IDS.MAC_TOGGLE_SMART_DASHES
                  },
                  {
                    role: 'toggleTextReplacement',
                    label: i18next.t('menu.editSubMenu.substitutionsSubMenu.toggleTextReplacement'),
                    id: MENU_ITEM_IDS.MAC_TOGGLE_TEXT_REPLACEMENT
                  }
                ]
              },
              {
                label: i18next.t('menu.editSubMenu.speechSubMenu.label'),
                submenu: [
                  {
                    role: 'startSpeaking',
                    label: i18next.t('menu.editSubMenu.speechSubMenu.startSpeakingLabel'),
                    id: MENU_ITEM_IDS.MAC_START_SPEAKING_MENU_ITEM
                  },
                  {
                    role: 'stopSpeaking',
                    label: i18next.t('menu.editSubMenu.speechSubMenu.stopSpeakingLabel'),
                    id: MENU_ITEM_IDS.MAC_STOP_SPEAKING_MENU_ITEM
                  }
                ]
              }
            ]
          : [
              {
                role: 'delete',
                label: i18next.t('menu.editSubMenu.deleteLabel'),
                id: MENU_ITEM_IDS.DELETE_MENU_ITEM
              },
              { type: 'separator' },
              {
                role: 'selectAll',
                label: i18next.t('menu.editSubMenu.selectAllLabel'),
                id: MENU_ITEM_IDS.SELECT_ALL_MENU_ITEM,
                accelerator: MENU_ITEM_ACCELERATORS.SELECT_ALL_MENU_ITEM
              }
            ])
      ]
    },
    {
      role: 'viewMenu',
      label: i18next.t('menu.viewSubMenu.label'),
      submenu: [
        {
          label: i18next.t('menu.viewSubMenu.reloadLabel'),
          id: MENU_ITEM_IDS.RELOAD_MENU_ITEM,
          accelerator: MENU_ITEM_ACCELERATORS.RELOAD_MENU_ITEM,
          click: (item, focusedWindow) => {
            const win = isMainWinAvailable(wins.mainWindow)
              ? wins.mainWindow
              : focusedWindow

            if (!win) {
              return
            }

            win.reload()
            triggerElectronLoad()
          }
        },
        {
          label: i18next.t('menu.viewSubMenu.forceReloadLabel'),
          id: MENU_ITEM_IDS.FORCE_RELOAD_MENU_ITEM,
          accelerator: MENU_ITEM_ACCELERATORS.FORCE_RELOAD_MENU_ITEM,
          click: (item, focusedWindow) => {
            const win = isMainWinAvailable(wins.mainWindow)
              ? wins.mainWindow
              : focusedWindow

            if (!win) {
              return
            }

            win.webContents.reloadIgnoringCache()
            triggerElectronLoad()
          }
        },
        {
          role: 'toggleDevTools',
          label: i18next.t('menu.viewSubMenu.toggleDevToolsLabel'),
          id: MENU_ITEM_IDS.TOGGLE_DEV_TOOLS_MENU_ITEM,
          accelerator: isMac
            ? MENU_ITEM_ACCELERATORS.MAC_TOGGLE_DEV_TOOLS_MENU_ITEM
            : MENU_ITEM_ACCELERATORS.TOGGLE_DEV_TOOLS_MENU_ITEM
        },
        { type: 'separator' },
        {
          role: 'resetZoom',
          label: i18next.t('menu.viewSubMenu.resetZoomLabel'),
          id: MENU_ITEM_IDS.RESET_ZOOM_MENU_ITEM,
          accelerator: MENU_ITEM_ACCELERATORS.RESET_ZOOM_MENU_ITEM
        },
        {
          role: 'zoomIn',
          label: i18next.t('menu.viewSubMenu.zoomInLabel'),
          id: MENU_ITEM_IDS.ZOOM_IN_MENU_ITEM,
          accelerator: MENU_ITEM_ACCELERATORS.ZOOM_IN_MENU_ITEM
        },
        {
          role: 'zoomOut',
          label: i18next.t('menu.viewSubMenu.zoomOutLabel'),
          id: MENU_ITEM_IDS.ZOOM_OUT_MENU_ITEM,
          accelerator: MENU_ITEM_ACCELERATORS.ZOOM_OUT_MENU_ITEM
        },
        { type: 'separator' },
        {
          role: 'togglefullscreen',
          label: i18next.t('menu.viewSubMenu.togglefullscreenLabel'),
          id: MENU_ITEM_IDS.TOGGLE_FULL_SCREEN_MENU_ITEM,
          accelerator: isMac
            ? MENU_ITEM_ACCELERATORS.MAC_TOGGLE_FULL_SCREEN_MENU_ITEM
            : MENU_ITEM_ACCELERATORS.TOGGLE_FULL_SCREEN_MENU_ITEM
        }
      ]
    },
    {
      role: 'windowMenu',
      label: i18next.t('menu.windowSubMenu.label'),
      submenu: [
        {
          role: 'minimize',
          label: i18next.t('menu.windowSubMenu.minimizeLabel'),
          id: MENU_ITEM_IDS.MINIMIZE_MENU_ITEM,
          accelerator: MENU_ITEM_ACCELERATORS.MINIMIZE_MENU_ITEM
        },
        {
          role: 'zoom',
          label: i18next.t('menu.windowSubMenu.zoomLabel'),
          id: MENU_ITEM_IDS.ZOOM_MENU_ITEM
        },
        ...(isMac
          ? [
              { type: 'separator' },
              {
                role: 'front',
                label: i18next.t('menu.windowSubMenu.frontLabel'),
                id: MENU_ITEM_IDS.MAC_FRONT_MENU_ITEM
              },
              { type: 'separator' },
              {
                role: 'window',
                label: i18next.t('menu.windowSubMenu.windowLabel')
              }
            ]
          : [
              {
                role: 'close',
                label: i18next.t('menu.fileSubMenu.closeLabel'),
                id: MENU_ITEM_IDS.CLOSE_MENU_ITEM,
                accelerator: MENU_ITEM_ACCELERATORS.CLOSE_MENU_ITEM
              }
            ])
      ]
    },
    {
      label: i18next.t('menu.toolsSubMenu.label'),
      submenu: [
        {
          label: i18next.t('menu.toolsSubMenu.dataManagementSubMenu.label'),
          submenu: [
            {
              label: i18next.t('menu.toolsSubMenu.dataManagementSubMenu.exportDbLabel'),
              id: MENU_ITEM_IDS.EXPORT_DB_MENU_ITEM,
              accelerator: MENU_ITEM_ACCELERATORS.EXPORT_DB_MENU_ITEM,
              click: exportDB({ pathToUserData, pathToUserDocuments })
            },
            {
              label: i18next.t('menu.toolsSubMenu.dataManagementSubMenu.importDbLabel'),
              id: MENU_ITEM_IDS.IMPORT_DB_MENU_ITEM,
              accelerator: MENU_ITEM_ACCELERATORS.IMPORT_DB_MENU_ITEM,
              click: importDB({ pathToUserData, pathToUserDocuments })
            },
            {
              label: i18next.t('menu.toolsSubMenu.dataManagementSubMenu.restoreDbLabel'),
              id: MENU_ITEM_IDS.RESTORE_DB_MENU_ITEM,
              accelerator: MENU_ITEM_ACCELERATORS.RESTORE_DB_MENU_ITEM,
              click: restoreDB()
            },
            {
              label: i18next.t('menu.toolsSubMenu.dataManagementSubMenu.backupDbLabel'),
              id: MENU_ITEM_IDS.BACKUP_DB_MENU_ITEM,
              accelerator: MENU_ITEM_ACCELERATORS.BACKUP_DB_MENU_ITEM,
              click: backupDB()
            },
            {
              label: i18next.t('menu.toolsSubMenu.dataManagementSubMenu.removeDbLabel'),
              id: MENU_ITEM_IDS.REMOVE_DB_MENU_ITEM,
              accelerator: MENU_ITEM_ACCELERATORS.REMOVE_DB_MENU_ITEM,
              click: removeDB({ pathToUserData })
            },
            {
              label: i18next.t('menu.toolsSubMenu.dataManagementSubMenu.clearAllDataLabel'),
              id: MENU_ITEM_IDS.CLEAR_ALL_DATA_MENU_ITEM,
              accelerator: MENU_ITEM_ACCELERATORS.CLEAR_ALL_DATA_MENU_ITEM,
              click: removeDB({
                pathToUserData,
                shouldAllTablesBeCleared: true
              })
            }
          ]
        },
        { type: 'separator' },
        {
          label: i18next.t('menu.toolsSubMenu.changeReportsFolderLabel'),
          id: MENU_ITEM_IDS.CHANGE_REPORTS_FOLDER_MENU_ITEM,
          click: changeReportsFolder({ pathToUserDocuments })
        },
        {
          label: i18next.t('menu.toolsSubMenu.changeSyncFrequencyLabel'),
          id: MENU_ITEM_IDS.CHANGE_SYNC_FREQUENCY_MENU_ITEM,
          click: changeSyncFrequency()
        }
      ]
    },
    {
      role: 'help',
      label: i18next.t('menu.helpSubMenu.label'),
      submenu: [
        {
          label: i18next.t('menu.helpSubMenu.openNewGitHubIssueLabel'),
          id: MENU_ITEM_IDS.REPORT_BUG_MENU_ITEM,
          accelerator: MENU_ITEM_ACCELERATORS.REPORT_BUG_MENU_ITEM,
          acceleratorWorksWhenHidden: false,
          click: manageNewGithubIssue,
          ..._getPrevMenuItemPropsById(MENU_ITEM_IDS.REPORT_BUG_MENU_ITEM, [
            { propName: 'visible', defaultVal: true },
            { propName: 'enabled', defaultVal: true }
          ])
        },
        { type: 'separator' },
        {
          label: i18next.t('menu.helpSubMenu.checkForUpdatesLabel'),
          id: MENU_ITEM_IDS.CHECK_UPDATE_MENU_ITEM,
          click: checkForUpdates(),
          ..._getPrevMenuItemPropsById(MENU_ITEM_IDS.CHECK_UPDATE_MENU_ITEM, [
            { propName: 'visible', defaultVal: true },
            { propName: 'enabled', defaultVal: !isAutoUpdateDisabled }
          ])
        },
        {
          label: i18next.t('menu.helpSubMenu.quitAndInstallUpdatesLabel'),
          id: MENU_ITEM_IDS.INSTALL_UPDATE_MENU_ITEM,
          click: quitAndInstall(),
          ..._getPrevMenuItemPropsById(MENU_ITEM_IDS.INSTALL_UPDATE_MENU_ITEM, [
            { propName: 'visible', defaultVal: false },
            { propName: 'enabled', defaultVal: true }
          ])
        },
        { type: 'separator' },
        {
          label: i18next.t('menu.helpSubMenu.userManualLabel'),
          id: MENU_ITEM_IDS.USER_MANUAL_MENU_ITEM,
          accelerator: isMac
            ? MENU_ITEM_ACCELERATORS.MAC_USER_MANUAL_MENU_ITEM
            : MENU_ITEM_ACCELERATORS.USER_MANUAL_MENU_ITEM,
          click: () => showDocs()
        },
        {
          label: i18next.t('menu.helpSubMenu.changelogLabel'),
          id: MENU_ITEM_IDS.SHOW_CHANGE_LOG_MENU_ITEM,
          click: () => showChangelog(),
          ..._getPrevMenuItemPropsById(MENU_ITEM_IDS.SHOW_CHANGE_LOG_MENU_ITEM, [
            { propName: 'visible', defaultVal: true },
            { propName: 'enabled', defaultVal: true }
          ])
        },
        ...(isMac
          ? []
          : [
              { type: 'separator' },
              {
                label: i18next.t(
                  'menu.helpSubMenu.aboutLabel',
                  { appName: app.name }
                ),
                id: MENU_ITEM_IDS.ABOUT_MENU_ITEM,
                accelerator: MENU_ITEM_ACCELERATORS.ABOUT_MENU_ITEM,
                click: showAboutModalDialog()
              }
            ])
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  isMenuInitialized = true
}
