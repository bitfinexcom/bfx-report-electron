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

const MENU_ITEM_IDS = require('./menu.item.ids')

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
          label: app.name,
          submenu: [
            {
              label: i18next.t(
                'menu.helpSubMenu.aboutLabel',
                { appName: app.name }
              ),
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
              label: i18next.t('menu.macMainSubmenu.hideLabel')
            },
            {
              role: 'hideOthers',
              label: i18next.t('menu.macMainSubmenu.hideOthersLabel')
            },
            {
              role: 'unhide',
              label: i18next.t('menu.macMainSubmenu.unhideLabel')
            },
            { type: 'separator' },
            {
              role: 'quit',
              label: i18next.t('menu.macMainSubmenu.quitLabel')
            }
          ]
        }]
      : []),
    { role: 'fileMenu', label: i18next.t('menu.fileSubMenu.label') },
    { role: 'editMenu', label: i18next.t('menu.editSubMenu.label') },
    {
      label: i18next.t('menu.viewSubMenu.label'),
      submenu: [
        {
          label: i18next.t('menu.viewSubMenu.reloadLabel'),
          accelerator: 'CmdOrCtrl+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.reload()
            }

            triggerElectronLoad()
          }
        },
        {
          label: i18next.t('menu.viewSubMenu.forceReloadLabel'),
          accelerator: 'CmdOrCtrl+Shift+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.webContents.reloadIgnoringCache()
            }

            triggerElectronLoad()
          }
        },
        {
          role: 'toggleDevTools',
          label: i18next.t('menu.viewSubMenu.toggleDevToolsLabel')
        },
        { type: 'separator' },
        {
          role: 'resetZoom',
          label: i18next.t('menu.viewSubMenu.resetZoomLabel')
        },
        {
          role: 'zoomIn',
          label: i18next.t('menu.viewSubMenu.zoomInLabel')
        },
        {
          role: 'zoomOut',
          label: i18next.t('menu.viewSubMenu.zoomOutLabel')
        },
        { type: 'separator' },
        {
          role: 'togglefullscreen',
          label: i18next.t('menu.viewSubMenu.togglefullscreenLabel')
        }
      ]
    },
    { role: 'windowMenu', label: i18next.t('menu.windowSubMenu.label') },
    {
      label: i18next.t('menu.toolsSubMenu.label'),
      submenu: [
        {
          label: i18next.t('menu.toolsSubMenu.dataManagementSubMenu.label'),
          submenu: [
            {
              label: i18next.t('menu.toolsSubMenu.dataManagementSubMenu.exportDbLabel'),
              click: exportDB({ pathToUserData, pathToUserDocuments })
            },
            {
              label: i18next.t('menu.toolsSubMenu.dataManagementSubMenu.importDbLabel'),
              click: importDB({ pathToUserData, pathToUserDocuments })
            },
            {
              label: i18next.t('menu.toolsSubMenu.dataManagementSubMenu.restoreDbLabel'),
              click: restoreDB()
            },
            {
              label: i18next.t('menu.toolsSubMenu.dataManagementSubMenu.backupDbLabel'),
              click: backupDB()
            },
            {
              label: i18next.t('menu.toolsSubMenu.dataManagementSubMenu.removeDbLabel'),
              click: removeDB({ pathToUserData })
            },
            {
              label: i18next.t('menu.toolsSubMenu.dataManagementSubMenu.clearAllDataLabel'),
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
          click: changeReportsFolder({ pathToUserDocuments })
        },
        {
          label: i18next.t('menu.toolsSubMenu.changeSyncFrequencyLabel'),
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
          accelerator: 'CmdOrCtrl+H',
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
                click: showAboutModalDialog()
              }
            ])
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  isMenuInitialized = true
}
