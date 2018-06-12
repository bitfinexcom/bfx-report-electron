'use strict'

module.exports = (req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '-1')
  res.setHeader('If-Modified-Since', '0')

  next()
}
