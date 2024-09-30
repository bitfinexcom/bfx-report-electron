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
                'menu.mainSubmenu.label',
                { appName: app.name }
              ),
              click: showAboutModalDialog()
            },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }]
      : []),
    { role: 'fileMenu' },
    { role: 'editMenu' },
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
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    { role: 'windowMenu' },
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
      submenu: [
        {
          label: i18next.t('menu.helpSubMenu.openNewGitHubIssueLabel'),
          id: MENU_ITEM_IDS.REPORT_BUG_MENU_ITEM,
          click: manageNewGithubIssue
        },
        { type: 'separator' },
        {
          label: i18next.t('menu.helpSubMenu.checkForUpdatesLabel'),
          enabled: !isAutoUpdateDisabled,
          id: MENU_ITEM_IDS.CHECK_UPDATE_MENU_ITEM,
          click: checkForUpdates()
        },
        {
          label: i18next.t('menu.helpSubMenu.quitAndInstallUpdatesLabel'),
          visible: false,
          id: MENU_ITEM_IDS.INSTALL_UPDATE_MENU_ITEM,
          click: quitAndInstall()
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
          click: () => showChangelog()
        },
        ...(isMac
          ? []
          : [
              { type: 'separator' },
              {
                label: i18next.t(
                  'menu.mainSubmenu.label',
                  { appName: app.name }
                ),
                click: showAboutModalDialog()
              }
            ])
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
}
