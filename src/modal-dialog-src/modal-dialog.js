'use strict'

window.addEventListener('load', () => {
  const inputs = document.querySelectorAll('.rangeInput input')

  const resizeProgress = (e) => {
    try {
      const target = e && e.target ? e.target : e
      const val = Number.parseFloat(target.value)
      const min = Number.parseFloat(target.min)
      const max = Number.parseFloat(target.max)
      const per = (((val - min) * 100) / (max - min))

      target.style.background = `linear-gradient(
        to right,
        #3085d6 0%,
        #3085d6 ${per}%,
        #f5f8fa ${per}%,
        #f5f8fa 100%
      )`
    } catch (err) {
      console.error(err)
    }
  }

  for (const input of inputs) {
    input.addEventListener('input', resizeProgress)
    resizeProgress(input)
  }
})
