'use strict'

const electron = require('electron')

const pauseApp = require('./pause-app')
const relaunch = require('./relaunch')

module.exports = ({
  dbPath,
  dbFileName
}) => {
  const dialog = electron.dialog || electron.remote.dialog
  const app = electron.app || electron.remote.app

  return () => {
    dialog.showOpenDialog(
      null,
      {
        title: 'ZIP file with DB',
        defaultPath: app.getPath('documents'),
        properties: ['openFile'],
        filters: [{ name: 'ZIP', extensions: ['zip'] }]
      },
      (files) => {
        // TODO:
        console.log('[---files---]:', files)

        pauseApp()
          .then(() => {
            setTimeout(() => {
              relaunch()
            }, 3000)
          })
          .catch((err) => {
            console.error(err)
          })
      }
    )
  }
}
