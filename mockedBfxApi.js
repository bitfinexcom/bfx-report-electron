'use strict'

const apiPort = Number.parseInt(process.env.BFX_MOCKED_API_PORT)
const { MockRESTv2Server } = require('bfx-api-mock-srv')

const mockedBfxApiMethods = require('./mockedBfxApiMethods')

class ExtraMockRESTv2Server extends MockRESTv2Server {
  constructor (args) {
    super(args)
    this._extraMockMethods = args?.extraMockMethods ?? new Map()

    for (const [method, route] of this._extraMockMethods) {
      for (const [key, val] of Object.entries(route)) {
        this._generateRoute(method, key, val)
      }
    }
  }

  _generateRoute (type, route, routeKey) {
    this._apiServer[type](route, (req, res) => {
      const keys = this.constructor.keysForRoute(req, routeKey)

      for (let i = 0; i < keys.length; i++) {
        if (this._responses.has(keys[i])) {
          const response = this._responses.get(keys[i])

          if (!response) {
            continue
          }

          try {
            const args = Object.assign(
              {}, req.params || {}, req.query || {}, req.body || {}
            )
            const data = typeof response === 'function'
              ? response(args)
              : JSON.parse(response)

            return res.json(data)
          } catch (err) {
            return res.status(500).json({
              error: 'bad response json'
            })
          }
        }
      }

      return res.status(404).json({
        error: 'unknown arguments',
        keys
      })
    })
  }

  listen (cb = () => {}) {
    if (this._apiServerHTTP) {
      return
    }

    this._apiServerHTTP = this._apiServer.listen(this._apiPort, cb)
  }
}

const getExtraMockMethods = () => (new Map([
  ['post', {
    '/v2/login': 'login',
    '/v2/login/verify': 'login_verify'
  }]
]))

;(async () => {
  try {
    const mockRESTv2Server = new ExtraMockRESTv2Server({
      apiPort,
      listen: false,
      extraMockMethods: getExtraMockMethods()
    })

    for (const [key, mockData] of mockedBfxApiMethods.entries()) {
      mockRESTv2Server.setResponse(key, mockData)
    }

    mockRESTv2Server.listen(() => {
      process.send({ state: 'MOCKED_BFX_API_READY' })
    })
  } catch (err) {
    console.debug(err)
  }
})()
