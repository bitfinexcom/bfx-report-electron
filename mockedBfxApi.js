'use strict'

const restUrl = `http://127.0.0.1:${process.env.BFX_MOCKED_API_PORT}`

setTimeout(() => {
  console.log('[restUrl]:', restUrl)
  process.send({ state: 'MOCKED_BFX_API_READY' })
}, 10_000)
