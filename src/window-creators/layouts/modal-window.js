window.addEventListener('load', async () => {
  // - `timer` if toast is hidden due to timer considering `timer` ms val
  // - `cancel` if toast is hidden due to cancel btn being pushed
  // - `confirm` if toast is hidden due to confirm btn being pushed
  // - `close` if toast is hidden due to other reasons
  const DISMISS_REASONS = {
    TIMER: 'timer',
    CANCEL: 'cancel',
    CONFIRM: 'confirm',
    CLOSE: 'close'
  }

  try {
    const modalElem = document.getElementById('modal')
    let toastId = null
    let timeout = null

    const sendModalClosedEvent = (args) => {
      window.bfxReportElectronApi?.sendModalClosedEvent({
        dismiss: DISMISS_REASONS.CANCEL,

        ...args
      })
    }
    const hideModal = () => {
      modalElem.style.display = 'none'
    }
    const showModal = () => {
      modalElem.style.display = 'flex'
    }
    const renderModal = (args) => {
      const {
        icon = 'info',
        title = null,
        text = null,
        showConfirmButton = true,
        showCancelButton = false,
        confirmButtonText = 'OK',
        cancelButtonText = 'Cancel',
        containerClassName = ''
      } = args ?? {}
      const elems = []
      const btnElems = []

      if (
        containerClassName &&
        typeof containerClassName === 'string'
      ) {
        modalElem.classList.add(containerClassName)
      }

      // TODO:
      const iconMap = {
        error: '<div class="modal__icon modal__icon--error">X</div>',
        loading: '<div class="modal__icon modal__icon--loading"></div>',
        success: '<div class="modal__icon modal__icon--success">V</div>',
        info: '<div class="modal__icon modal__icon--info">i</div>',
        question: '<div class="modal__icon modal__icon--question">?</div>'
      }
      const iconHTML = iconMap[icon]

      if (iconHTML) {
        elems.push(iconHTML)
      }
      if (title) {
        elems.push(`<div class="modal__title">${title}</div>`)
      }
      if (text) {
        elems.push(`<div class="modal__text">${text}</div>`)
      }
      if (showConfirmButton) {
        btnElems.push(`<button id="confirmBtn" class="modal__btn modal__btn--confirm">${confirmButtonText}</button>`)
      }
      if (showCancelButton) {
        btnElems.push(`<button id="cancelBtn" class="modal__btn modal__btn--cancel">${cancelButtonText}</button>`)
      }
      if (btnElems.length > 0) {
        elems.push(`<div class="modal__btns">${btnElems.join('\n')}</div>`)
      }

      modalElem.innerHTML = elems.join('\n')

      if (showConfirmButton) {
        const confirmBtnElem = document.getElementById('confirmBtn')
        confirmBtnElem.addEventListener('click', (e) => {
          e.preventDefault()

          clearTimeout(timeout)
          hideModal()
          sendModalClosedEvent({
            dismiss: DISMISS_REASONS.CONFIRM,
            toastId: args?.toastId
          })
        }, false)
      }
      if (showCancelButton) {
        const cancelBtnElem = document.getElementById('cancelBtn')
        cancelBtnElem.addEventListener('click', (e) => {
          e.preventDefault()

          clearTimeout(timeout)
          hideModal()
          sendModalClosedEvent({
            dismiss: DISMISS_REASONS.CANCEL,
            toastId: args?.toastId
          })
        }, false)
      }
    }

    window.bfxReportElectronApi?.onFireModalEvent((args) => {
      if (toastId) {
        sendModalClosedEvent({
          dismiss: DISMISS_REASONS.CLOSE,
          toastId
        })
      }

      toastId = args?.toastId
      renderModal(args)
      showModal()

      if (!Number.isInteger(args?.timer)) {
        return
      }

      clearTimeout(timeout)
      timeout = setTimeout(() => {
        hideModal()
        sendModalClosedEvent({
          dismiss: args?.timer
            ? DISMISS_REASONS.TIMER
            : DISMISS_REASONS.CLOSE,
          toastId: args?.toastId
        })
      }, args?.timer)
    })
  } catch (err) {
    console.error(err)
  }
})
