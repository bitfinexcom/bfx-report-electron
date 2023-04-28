'use strict'

module.exports = (value) => {
  if (typeof value === 'boolean') {
    return value
  }

  const normalizedValue = value.toString()
    .trim()
    .toLowerCase()

  if (
    normalizedValue === 'true' ||
    normalizedValue === '1' ||
    normalizedValue === 1 ||
    normalizedValue === 'yes' ||
    normalizedValue === 'y'
  ) {
    return true
  }

  return false
}
