'use strict'

const { WrkApi } = require('bfx-wrk-api')

class WrkReportServiceApi extends WrkApi {
  constructor (conf, ctx) {
    super(conf, ctx)

    this.loadConf('service.report', 'report')

    this.init()
    this.start()
  }

  getApiConf () {
    return {
      path: 'service.report'
    }
  }

  init () {
    super.init()
  }
}

module.exports = WrkReportServiceApi
