'use strict'

const ipcs = require('./ipcs')
const {
  showLoadingWindow
} = require('./window-creators/change-loading-win-visibility-state')

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

module.exports = async (opts) => {
  const {
    beforeClosingServHook = () => {},
    loadingWinParams
  } = opts ?? {}

  await showLoadingWindow({
    isRequiredToCloseAllWins: true,
    ...loadingWinParams
  })

  await beforeClosingServHook()

  await _closeServer()
}
