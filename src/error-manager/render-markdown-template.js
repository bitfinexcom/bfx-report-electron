'use strict'

const fs = require('fs')
const path = require('path')

const templateByDefault = fs.readFileSync(
  path.join(__dirname, 'github-issue-template.md'),
  'utf8'
)
const placeholderPattern = new RegExp(/\$\{[a-zA-Z0-9]+\}/, 'g')

module.exports = (
  params = {},
  template = templateByDefault
) => {
  if (
    !params ||
    typeof params !== 'object'
  ) {
    return template
  }

  const str = template.replace(placeholderPattern, (match) => {
    const propName = match.replace('${', '').replace('}', '')

    if (
      !params ||
      typeof params !== 'object' ||
      (
        !Number.isFinite(params[propName]) &&
        typeof params[propName] !== 'string'
      )
    ) {
      return ''
    }

    return params[propName]
  })

  return str
}
