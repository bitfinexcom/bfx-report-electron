'use string'

const os = require('os')
const cleanStack = import('clean-stack')

module.exports = (params) => {
  const { error } = { ...params }

  const title = '[BUG REPORT]'
  const description = 'Bug report'
  const errBoxTitle = 'Bug report'
  const errBoxDescription = 'A new Github issue will be opened'

  if (
    error &&
    typeof error === 'string'
  ) {
    return {
      title,
      description: [
        'An error occurred',
        '',
        '```vim',
        error,
        '```'
      ].join(os.EOL),
      errBoxTitle,
      errBoxDescription: [
        errBoxDescription,
        'An error occurred',
        error
      ].join(os.EOL)
    }
  }
  if (error instanceof Error) {
    const errStr = error.toString()
    const stack = error.stack
      ? cleanStack(error.stack)
      : errStr

    return {
      title: `${title} ${errStr}`,
      description: [
        'An error occurred',
        '',
        '```vim',
        stack,
        '```'
      ].join(os.EOL),
      errBoxTitle,
      errBoxDescription: [
        errBoxDescription,
        'An error occurred',
        stack
      ].join(os.EOL)
    }
  }

  return {
    title,
    description,
    errBoxTitle,
    errBoxDescription
  }
}
