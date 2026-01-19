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
  const ICON_NAMES = {
    ERROR: 'error',
    LOADING: 'loading',
    SUCCESS: 'success',
    INFO: 'info',
    QUESTION: 'question'
  }
  const iconMap = {
    [ICON_NAMES.ERROR]: `\
<div class="modal__icon modal__icon--error">
  <svg width="74" height="74" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#clip0)">
  <path d="M36.9746 32.2861L14.0432 71.5937L15.418 72.4039V73.9997H58.5312V72.4039L59.9059 71.5937L36.9746 32.2861ZM18.1925 70.8079L36.9746 38.6205L55.7566 70.8079H18.1925Z" fill="#F05359"/>
  <path d="M38.572 53.9414H35.3801V67.7886H38.572V53.9414Z" fill="#F05359"/>
  <path d="M38.572 47.7783H35.3801V50.8473H38.572V47.7783Z" fill="#F05359"/>
  <path d="M63.5413 23.718C64.2042 21.6065 64.4741 19.4215 64.3269 17.1873C64.0568 12.6207 62.0682 8.32396 58.7291 5.08311C55.3899 1.84244 51.0689 0.0498437 46.5513 0.00083903C39.0137 -0.072855 32.3111 4.71482 29.6596 11.663C26.9343 9.42881 23.3988 8.32396 19.8146 8.69205C14.6584 9.23242 10.1655 12.8416 8.39779 17.8744C7.61222 20.0351 7.73492 23.0057 7.85762 24.5772C2.99625 27.8673 0.000976562 33.416 0.000976562 39.3084C0.000976562 49.1046 7.95581 57.0593 17.7519 57.0593C18.0465 57.0593 18.3657 57.0593 18.7093 57.0346L18.4148 53.8674C18.2184 53.8921 17.9975 53.8921 17.7519 53.8921C9.72353 53.8921 3.19282 47.3614 3.19282 39.333C3.19282 34.2263 5.9427 29.4141 10.3621 26.7869L11.2705 26.2468L11.1233 25.1909C10.9761 24.0861 10.7306 20.7962 11.3934 18.9548C12.7682 15.0511 16.1811 12.2767 20.1093 11.8839C23.5958 11.5403 26.9593 12.9643 29.1443 15.7139L31.2558 18.3409L31.9677 15.0511C33.4408 8.15207 39.4806 3.1925 46.3796 3.1925C46.4043 3.1925 46.4533 3.1925 46.5023 3.1925C54.1378 3.26619 60.693 9.6252 61.135 17.3833C61.2822 19.7649 60.8649 22.0973 59.9075 24.3315L59.0482 26.3448L61.2332 26.5657C66.6838 27.1058 70.8086 31.7461 70.8086 37.3441C70.8086 48.2942 65.5789 53.8429 55.2919 53.8429V57.0348C62.6573 57.0348 67.9607 54.5058 71.0541 49.4729C72.9939 46.281 74.0004 42.2056 74.0004 37.3444C74.0004 30.789 69.6304 25.2401 63.5413 23.718Z" fill="#F05359"/>
  </g>
  <defs>
  <clipPath id="clip0">
  <rect width="74" height="74" fill="white"/>
  </clipPath>
  </defs>
  </svg>
</div>`,
    [ICON_NAMES.LOADING]: '<div class="modal__icon modal__icon--loading"></div>',
    [ICON_NAMES.SUCCESS]: `\
<div class="modal__icon modal__icon--success">
  <svg class="icon--checked" width="74" height="74" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M71.8848 10.116C70.7962 9.02554 69.0298 9.02366 67.9412 10.1114L34.4833 43.4811L22.4117 30.3702C21.3686 29.2379 19.6051 29.1645 18.4709 30.2075C17.3377 31.2505 17.2651 33.015 18.3082 34.1482L32.3459 49.3935C32.86 49.9523 33.5795 50.2768 34.3382 50.2925C34.3585 50.2934 34.3782 50.2934 34.3977 50.2934C35.135 50.2934 35.8442 50.0006 36.3666 49.48L71.8793 14.0604C72.9706 12.9728 72.9725 11.2065 71.8848 10.116Z" fill="#16B157"/>
  <path d="M71.211 34.211C69.6706 34.211 68.4221 35.4594 68.4221 37C68.4221 54.3268 54.3268 68.4221 37 68.4221C19.6742 68.4221 5.57789 54.3268 5.57789 37C5.57789 19.6742 19.6742 5.57789 37 5.57789C38.5404 5.57789 39.789 4.32943 39.789 2.78902C39.789 1.24846 38.5404 0 37 0C16.598 0 0 16.598 0 37C0 57.4012 16.598 74 37 74C57.4012 74 74 57.4012 74 37C74 35.4596 72.7515 34.211 71.211 34.211Z" fill="#16B157"/>
  </svg>
</div>`,
    [ICON_NAMES.INFO]: '<div class="modal__icon modal__icon--info">i</div>',
    [ICON_NAMES.QUESTION]: '<div class="modal__icon modal__icon--question">?</div>'
  }

  try {
    const modalElem = document.getElementById('modal')
    const closeBtnElem = document.getElementById('closeBtn')
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
    const finalizeModalWindow = (args, e) => {
      e?.preventDefault?.()

      clearTimeout(timeout)
      hideModal()
      sendModalClosedEvent(args)
    }
    const renderModal = (args) => {
      const {
        icon = ICON_NAMES.INFO,
        title = null,
        text = null,
        showConfirmButton = true,
        focusConfirm = false,
        showCancelButton = false,
        focusCancel = false,
        confirmButtonText = 'OK',
        cancelButtonText = 'Cancel',
        confirmHotkey = 'Enter',
        containerClassName = '',
        textClassName = '',
        showWinCloseButton = false
      } = args ?? {}
      const elems = []
      const btnElems = []
      const _confirmHotkey = (
        confirmHotkey &&
        typeof confirmHotkey === 'string' &&
        !focusConfirm &&
        !focusCancel
      )
        ? confirmHotkey
        : ''

      if (
        containerClassName &&
        typeof containerClassName === 'string'
      ) {
        modalElem.classList.add(containerClassName)
      }
      if (showWinCloseButton) {
        closeBtnElem.addEventListener('click', (e) => {
          finalizeModalWindow({
            dismiss: DISMISS_REASONS.CANCEL,
            toastId: args?.toastId
          }, e)
        })

        closeBtnElem.classList.remove('window-btn--disabled')
      } else {
        closeBtnElem.classList.add('window-btn--disabled')
      }

      const iconHTML = iconMap[icon]

      if (iconHTML) {
        elems.push(iconHTML)
      }
      if (title) {
        elems.push(`<div class="modal__title">${title}</div>`)
      }
      if (text) {
        const className = (
          textClassName &&
          typeof textClassName === 'string'
        )
          ? ` ${textClassName}`
          : ''

        elems.push(`<div class="modal__text${className}">${text}</div>`)
      }
      if (showConfirmButton) {
        btnElems.push(`<button\
${focusConfirm ? ' autofocus' : ''} \
id="confirmBtn" \
class="modal__btn modal__btn--confirm">${confirmButtonText}</button>`)
      }
      if (showCancelButton) {
        btnElems.push(`<button\
${focusCancel ? ' autofocus' : ''} \
id="cancelBtn" \
class="modal__btn modal__btn--cancel">${cancelButtonText}</button>`)
      }
      if (btnElems.length > 0) {
        elems.push(`<div class="modal__btns">${btnElems.join('\n')}</div>`)
      }

      modalElem.innerHTML = elems.join('\n')

      const confirmBtnElem = document.getElementById('confirmBtn')
      const cancelBtnElem = document.getElementById('cancelBtn')

      if (showConfirmButton) {
        confirmBtnElem.addEventListener('click', (e) => {
          finalizeModalWindow({
            dismiss: DISMISS_REASONS.CONFIRM,
            toastId: args?.toastId
          }, e)
        })
      }
      if (showCancelButton) {
        cancelBtnElem.addEventListener('click', (e) => {
          finalizeModalWindow({
            dismiss: DISMISS_REASONS.CANCEL,
            toastId: args?.toastId
          }, e)
        })
      }

      document.addEventListener('keydown', (e) => {
        if (
          (
            e.key !== _confirmHotkey &&
            e.key !== 'Escape'
          ) ||
          (
            e.key === _confirmHotkey &&
            !showConfirmButton
          )
        ) {
          return
        }

        const dismiss = (
          e.key === _confirmHotkey &&
          showConfirmButton
        )
          ? DISMISS_REASONS.CONFIRM
          : DISMISS_REASONS.CANCEL

        finalizeModalWindow({
          dismiss,
          toastId: args?.toastId
        }, e)
      })
    }

    window.bfxReportElectronApi?.onCloseModalEvent(() => {
      if (!toastId) {
        return
      }

      finalizeModalWindow({
        dismiss: DISMISS_REASONS.CLOSE,
        toastId
      })
    })
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
      setTimeout(() => {
        window.bfxReportElectronApi?.setWindowHeight({
          height: args?.preventSettingHeightToContent
            ? null
            : modalElem.scrollHeight
        })
      }, 100)

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
