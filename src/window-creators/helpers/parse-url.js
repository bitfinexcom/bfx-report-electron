'use strict'

module.exports = (url) => {
  if (typeof url !== 'string') {
    return
  }

  try {
    return new URL(url)
  } catch (err) {
    console.debug('Failed to parse url:', url)
  }
}
