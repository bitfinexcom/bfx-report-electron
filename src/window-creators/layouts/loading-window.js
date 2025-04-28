window.initLoadingWindow = (opts) => {
  const apiMethodPrefix = opts?.apiMethodPrefix ?? ''

  const rollers = document.getElementsByClassName('lds-roller')
  const descriptionElem = document.getElementById('description')
  const minBtnElem = document.getElementById('minBtn')
  const closeBtnElem = document.getElementById('closeBtn')

  minBtnElem.onclick = async () => {
    try {
      await window.bfxReportElectronApi?.[`minimize${apiMethodPrefix}LoadingWindow`]()
    } catch (err) {
      console.error(err)
    }
  }
  closeBtnElem.onclick = async () => {
    try {
      await window.bfxReportElectronApi?.[`close${apiMethodPrefix}LoadingWindow`]()
    } catch (err) {
      console.error(err)
    }
  }

  setTimeout(() => {
    for (const roller of rollers) {
      roller.classList.add('show-roller')
    }
  }, 2500)

  window.bfxReportElectronApi?.[`on${apiMethodPrefix}LoadingBtnStates`]((args) => {
    try {
      if (args?.shouldMinimizeBtnBeShown) {
        minBtnElem.classList.remove('window-btn--disabled')
      } else {
        minBtnElem.classList.add('window-btn--disabled')
      }
      if (args?.shouldCloseBtnBeShown) {
        closeBtnElem.classList.remove('window-btn--disabled')
      } else {
        closeBtnElem.classList.add('window-btn--disabled')
      }
    } catch (err) {
      console.debug(err)
    }
  })
  window.bfxReportElectronApi?.[`on${apiMethodPrefix}LoadingDescription`]((args) => {
    try {
      if (typeof args?.description !== 'string') {
        window.bfxReportElectronApi?.[`send${apiMethodPrefix}LoadingDescriptionReady`]()

        return
      }

      descriptionElem.innerHTML = args.description

      descriptionElem.style.display = args.description
        ? 'block'
        : 'none'

      window.bfxReportElectronApi?.[`send${apiMethodPrefix}LoadingDescriptionReady`]()
    } catch (err) {
      console.error(err)

      window.bfxReportElectronApi?.[`send${apiMethodPrefix}LoadingDescriptionReady`]({ err })
    }
  })
}
