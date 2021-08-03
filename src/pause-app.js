'use strict'

const ipcs = require('./ipcs')
const {
  showLoadingWindow
} = require('./change-loading-win-visibility-state')

const _closeServer = () => {
  return new Promise((resolve, reject) => {
    try {
      if (
        !ipcs.serverIpc ||
        typeof ipcs.serverIpc !== 'object'
      ) {
        resolve()

        return
      }

      ipcs.serverIpc.once('close', () => {
        resolve()
      })

      ipcs.serverIpc.kill('SIGINT')
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = async ({
  beforeClosingServHook = () => {}
}) => {
  await showLoadingWindow({ isRequiredToCloseAllWins: true })

  await beforeClosingServHook()

  await _closeServer()
}
