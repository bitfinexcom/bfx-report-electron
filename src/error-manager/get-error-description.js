'use string'

const os = require('os')
const cleanStack = require('clean-stack')

module.exports = (params) => {
  const { error } = { ...params }

  const _title = '[BUG REPORT]'
  const _description = 'Bug report'

  if (
    error &&
    typeof error === 'string'
  ) {
    return {
      title: _title,
      description: [
        'An error occurred',
        '',
        '```vim',
        error,
        '```'
      ].join(os.EOL)
    }
  }
  if (error instanceof Error) {
    const errStr = error.toString()
    const stack = error.stack
      ? cleanStack(error.stack)
      : errStr

    return {
      title: `${_title} ${errStr}`,
      description: [
        'An error occurred',
        '',
        '```vim',
        stack,
        '```'
      ].join(os.EOL)
    }
  }

  return {
    title: _title,
    description: _description
  }
}
