'use strict'

const bfxFactory = require('./bfx.factory')

const getREST = (auth) => {
  if (typeof auth !== 'object') {
    throw new Error('ERR_ARGS_NO_AUTH_DATA')
  }

  const bfx = bfxFactory({ ...auth })

  return bfx.rest(2, { transform: true })
}

module.exports = {
  getREST
}
