'use strict'

const wins = require('../windows')

const WINDOW_EVENT_NAMES = {
  CLOSED: 'closed'
}

const windowMap = new Map()

const addOnceProcEventHandler = (eventName, handler, window) => {
  const _window = window ?? wins.mainWindow

  if (
    !_window ||
    !eventName ||
    typeof eventName !== 'string' ||
    typeof handler !== 'function'
  ) {
    return {
      isAdded: false,
      removeListener: () => {}
    }
  }

  const handlerSet = _setWinEventHandler(eventName, handler, window)

  const ctx = {
    isAdded: true,
    removeListener: () => handlerSet.delete(handler)
  }

  return ctx
}

const _setWinEventHandler = (eventName, handler, window) => {
  const winEventHandlerMap = _getWinEventHandlerMap(window)
  const foundHandlerSet = winEventHandlerMap.get(eventName)?.handlerSet

  if (foundHandlerSet instanceof Set) {
    foundHandlerSet.add(handler)

    return foundHandlerSet
  }

  const handlerSet = new Set([handler])
  const rootHandler = () => {
    winEventHandlerMap.delete(eventName)

    for (const handler of handlerSet) {
      try {
        handlerSet.delete(handler)

        const res = handler()

        if (!(res instanceof Promise)) {
          return
        }

        res.then(() => {}, (err) => { console.error(err) })
      } catch (err) {
        console.error(err)
      }
    }
  }

  window.once(eventName, rootHandler)
  winEventHandlerMap.set(eventName, {
    rootHandler,
    handlerSet
  })

  return handlerSet
}

const _getWinEventHandlerMap = (window) => {
  const foundWinEventHandlerMap = windowMap.get(window)

  if (foundWinEventHandlerMap instanceof Map) {
    return foundWinEventHandlerMap
  }

  const winEventHandlerMap = new Map()
  windowMap.set(window, winEventHandlerMap)

  return winEventHandlerMap
}

module.exports = {
  WINDOW_EVENT_NAMES,

  addOnceProcEventHandler
}
