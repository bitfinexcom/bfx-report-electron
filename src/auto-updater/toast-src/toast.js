'use strict'

window.addEventListener('load', () => {
  try {
    const { ipcRenderer } = require('electron')

    const container = document.body
    const processWrapper = document.createElement('div')
    const htmlContainers = document.getElementsByClassName('swal2-popup')
    const actionContainers = document.getElementsByClassName('swal2-actions')
    const titleContainers = document.getElementsByClassName('swal2-title')
    const elemContainers = [
      ...actionContainers,
      ...titleContainers
    ]

    for (const container of htmlContainers) {
      container.style.display = 'flex'
      container.style.width = 'auto'
    }
    for (const container of elemContainers) {
      container.style.display = 'flex'
    }

    processWrapper.className = 'process'
    container.append(processWrapper)

    const resizeProgress = (per) => {
      if (!Number.isFinite(per)) {
        return
      }

      processWrapper.style.display = 'block'
      processWrapper.style.background = `linear-gradient(
        to right,
        #5ebefa 0%,
        #5ebefa ${per}%,
        #f5f8fa ${per}%,
        #f5f8fa 100%
      )`
    }

    ipcRenderer.on('progress', (event, progress) => {
      try {
        resizeProgress(progress)

        if (progress < 100) {
          return
        }

        setTimeout(() => window.close(), 300)
      } catch (err) {
        console.error(err)
      }
    })
  } catch (err) {
    console.error(err)
  }
})
