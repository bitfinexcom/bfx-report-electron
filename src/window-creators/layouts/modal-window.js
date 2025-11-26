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
        icon = 'info', // it can be one of ['error', 'loading', 'success', 'info', 'question']
        title = null,
        text = null,
        showConfirmButton = true,
        showCancelButton = false,
        confirmButtonText = 'OK',
        cancelButtonText = 'Cancel'
      } = args ?? {}
      const elems = []

      // TODO:
      const iconMap = {
        error: '<span class="modal__icon modal__icon--error">X</span>',
        loading: '<span class="modal__icon modal__icon--loading"></span>',
        success: '<span class="modal__icon modal__icon--success">V</span>',
        info: '<span class="modal__icon modal__icon--info">i</span>',
        question: '<span class="modal__icon modal__icon--question">?</span>'
      }
      const iconHTML = iconMap[icon]

      if (iconHTML) {
        elems.push(iconHTML)
      }
      if (title) {
        elems.push(`<span class="modal__title">${title}</span>`)
      }
      if (text) {
        elems.push(`<span class="modal__text">${text}</span>`)
      }
      if (showConfirmButton) {
        elems.push(`<button id="confirmBtn" class="modal__confirm-btn">${confirmButtonText}</button>`)
      }
      if (showCancelButton) {
        elems.push(`<button id="cancelBtn" class="modal__cancel-btn">${cancelButtonText}</button>`)
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
