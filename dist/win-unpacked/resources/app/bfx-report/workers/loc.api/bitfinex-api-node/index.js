'use strict'

const BFXBase = require('bitfinex-api-node')
const RESTv2 = require('./lib/transports/rest2')

class BFX extends BFXBase {
  /**
   * @param {number} versio
   * @param {Object} extraOpts
   * @return {RESTv2}
   */
  rest (version, extraOpts = {}) {
    if (version !== 2) {
      throw new Error(`Invalid http API version: ${version}`)
    }

    const key = `2|${JSON.stringify(extraOpts)}`

    if (!this._transportCache.rest[key]) {
      Object.assign(extraOpts, this._restArgs)
      const payload = this._getTransportPayload(extraOpts)

      this._transportCache.rest[key] = new RESTv2(payload)
    }

    return this._transportCache.rest[key]
  }
}

module.exports = BFX
