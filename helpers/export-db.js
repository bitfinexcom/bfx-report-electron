'use strict'

const electron = require('electron')

module.exports = ({
  dbPath,
  dbFileName
}) => {
  const dialog = electron.dialog || electron.remote.dialog
  const app = electron.app || electron.remote.app

  return () => {
    dialog.showSaveDialog(
      null,
      {
        title: 'ZIP file with DB',
        defaultPath: app.getPath('documents'),
        filters: [{ name: 'ZIP', extensions: ['zip'] }]
      },
      (files) => {
        // TODO:
        console.log('[---files---]:', files)
      }
    )
  }
}
