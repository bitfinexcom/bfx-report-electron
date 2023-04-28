'use strict'

const electron = require('electron')

const { app, Menu } = electron
const isMac = process.platform === 'darwin'

const exportDB = require('./export-db')
const importDB = require('./import-db')
const removeDB = require('./remove-db')
const restoreDB = require('./restore-db')
const backupDB = require('./backup-db')
const changeReportsFolder = require('./change-reports-folder')
const changeSyncFrequency = require('./change-sync-frequency')
const triggerElectronLoad = require('./trigger-electron-load')
const showAboutModalDialog = require('./show-about-modal-dialog')
const {
  checkForUpdates,
  quitAndInstall
} = require('./auto-updater')
const { manageNewGithubIssue } = require('./error-manager')
const showDocs = require('./show-docs')
const { showChangelog } = require('./changelog-manager')
const parseEnvValToBool = require('./helpers/parse-env-val-to-bool')

const isAutoUpdateDisabled = parseEnvValToBool(process.env.IS_AUTO_UPDATE_DISABLED)

module.exports = ({
  pathToUserData,
  pathToUserDocuments
}) => {
  const menuTemplate = [
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            {
              label: `About ${app.name}`,
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
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.reload()
            }

            triggerElectronLoad()
          }
        },
        {
          label: 'Force Reload',
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
      label: 'Tools',
      submenu: [
        {
          label: 'Data Management',
          submenu: [
            {
              label: 'Export DB',
              click: exportDB({ pathToUserData, pathToUserDocuments })
            },
            {
              label: 'Import DB',
              click: importDB({ pathToUserData, pathToUserDocuments })
            },
            {
              label: 'Restore DB',
              click: restoreDB()
            },
            {
              label: 'Backup DB',
              click: backupDB()
            },
            {
              label: 'Remove DB',
              click: removeDB({ pathToUserData })
            },
            {
              label: 'Clear all data',
              click: removeDB({
                pathToUserData,
                shouldAllTablesBeCleared: true
              })
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Change reports folder',
          click: changeReportsFolder({ pathToUserDocuments })
        },
        {
          label: 'Change sync frequency',
          click: changeSyncFrequency()
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Open new GitHub issue',
          id: 'REPORT_BUG_MENU_ITEM',
          click: manageNewGithubIssue
        },
        { type: 'separator' },
        {
          label: 'Check for updates',
          enabled: !isAutoUpdateDisabled,
          id: 'CHECK_UPDATE_MENU_ITEM',
          click: checkForUpdates()
        },
        {
          label: 'Quit and install updates',
          visible: false,
          id: 'INSTALL_UPDATE_MENU_ITEM',
          click: quitAndInstall()
        },
        { type: 'separator' },
        {
          label: 'User manual',
          accelerator: 'CmdOrCtrl+H',
          click: () => showDocs()
        },
        {
          label: 'Changelog',
          click: () => showChangelog()
        },
        ...(isMac
          ? []
          : [
              { type: 'separator' },
              {
                label: 'About',
                click: showAboutModalDialog()
              }
            ])
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
}
