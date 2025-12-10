'use strict'

const { v4: uuidv4 } = require('uuid')

module.exports = (params) => {
  const {
    handlerSet,
    setInitFlagFn = () => {},
    getInitFlagFn = () => {},
    onClosedEventFn = () => {}
  } = params ?? {}

  // Sign toast with uuid for further identification
  const toastId = uuidv4()

  const closedEventPromise = new Promise((resolve, reject) => {
    const handler = (event, args) => {
      if (args?.toastId !== toastId) {
        return
      }

      handlerSet.delete(handler)

      if (args?.error) {
        const err = args.error instanceof Error
          ? args.error
          : new Error(args.error)

        reject(err)

        return
      }

      resolve(args)
    }
    handlerSet.add(handler)

    if (getInitFlagFn()) {
      return
    }

    setInitFlagFn(true)
    onClosedEventFn((event, args) => {
      for (const handler of handlerSet) {
        handler(event, args)
      }
    })
  })

  return {
    closedEventPromise,
    toastId
  }
}
