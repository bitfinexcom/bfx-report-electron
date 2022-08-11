'use strict'

module.exports = (props = {}) => {
  const _container = props?.container ?? ''
  delete props.container

  return {
    _container,
    set container (val) {
      if (val === 'noscrollbar') {
        return
      }

      this._container = `${this._container} ${val}`
    },
    get container () {
      return this._container
    },
    ...props
  }
}
