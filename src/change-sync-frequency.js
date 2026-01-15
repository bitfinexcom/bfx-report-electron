'use strict'

const electron = require('electron')
const Alert = require('electron-alert')
const cronValidate = require('cron-validate')
const path = require('path')
const fs = require('fs')
const i18next = require('i18next')

const {
  createModalWindow
} = require('./window-creators')

const getUIFontsAsCSSString = require(
  './helpers/get-ui-fonts-as-css-string'
)

const fontsStyle = getUIFontsAsCSSString()
const themesStyle = fs.readFileSync(path.join(
  __dirname, './window-creators/layouts/themes.css'
))
const modalDialogStyle = fs.readFileSync(path.join(
  __dirname, 'modal-dialog-src/modal-dialog.css'
))
const modalDialogScript = fs.readFileSync(path.join(
  __dirname, 'modal-dialog-src/modal-dialog.js'
))

const {
  SyncFrequencyChangingError
} = require('./errors')
const showErrorModalDialog = require('./show-error-modal-dialog')
const pauseApp = require('./pause-app')
const relaunch = require('./relaunch')
const { getConfigsKeeperByName } = require('./configs-keeper')
const getAlertCustomClassObj = require(
  './helpers/get-alert-custom-class-obj'
)
const {
  WINDOW_EVENT_NAMES,
  addOnceProcEventHandler
} = require('./window-creators/window-event-manager')
const ThemeIpcChannelHandlers = require(
  './window-creators/main-renderer-ipc-bridge/theme-ipc-channel-handlers'
)

const _getSchedulerRule = (timeFormat, alertRes) => {
  if (timeFormat.value === 'days') {
    return `0 0 */${alertRes.value} * *`
  }
  if (timeFormat.value === 'hours') {
    return `0 */${alertRes.value} * * *`
  }

  return `*/${alertRes.value} * * * *`
}

const _testTime = (time) => {
  return (
    time &&
    typeof time === 'string' &&
    /^\*\/\d{1,2}$/i.test(time)
  )
}

const _getTime = (timeFormat, time) => {
  return {
    timeFormat,
    value: time.replace('*/', '')
  }
}

const _getTimeDataFromRule = (rule) => {
  const cronResult = cronValidate(rule)

  if (!cronResult.isValid()) {
    return { timeFormat: 'hours', value: 2 }
  }

  const value = cronResult.getValue()

  if (_testTime(value.daysOfMonth)) {
    return _getTime('days', value.daysOfMonth)
  }
  if (_testTime(value.hours)) {
    return _getTime('hours', value.hours)
  }
  if (_testTime(value.minutes)) {
    return _getTime('mins', value.minutes)
  }

  return { timeFormat: 'hours', value: 2 }
}

const _fireFrameless = (alert, opts) => {
  const bwOptions = {
    frame: false,
    transparent: true,
    thickFrame: false,
    closable: false,
    backgroundColor: ThemeIpcChannelHandlers.getWindowBackgroundColor(),
    hasShadow: false
  }
  const swalOptions = {
    allowOutsideClick: false,
    ...opts
  }

  return alert.fire(
    swalOptions,
    bwOptions,
    null,
    true,
    false,
    sound
  )
}

const _fireAlert = async (params) => {
  const {
    title = '',
    text = '',
    currentProgressStep = 0,
    inputRadioOptions = [],
    inputRangeOptions = []
  } = params ?? {}

  const res = await createModalWindow(
    {
      icon: 'question',
      title,
      text,
      textClassName: 'markdown-body',
      showConfirmButton: true,
      confirmButtonText: i18next.t('common.confirmButtonText'),
      showCancelButton: true,
      cancelButtonText: i18next.t('common.cancelButtonText'),
      progressSteps: [1, 2],
      currentProgressStep,
      inputRadioOptions,
      makeInputRadioInline: true,
      inputRangeOptions,
      preventSettingHeightToContent: true
    },
    {
      width: 500,
      height: 400,
      shouldWinBeClosedIfClickingOutside: true,
      shouldDevToolsBeShown: true
    })

  return res?.modalRes ?? {}
}

const fonts = `<style>${fontsStyle}</style>`
const themes = `<style>${themesStyle}</style>`
const style = `<style>${modalDialogStyle}</style>`
const script = `<script type="text/javascript">${modalDialogScript}</script>`
const sound = { freq: 'F2', type: 'triange', duration: 1.5 }

module.exports = () => {
  const configsKeeper = getConfigsKeeperByName('main')
  const alert = new Alert([fonts, themes, style, script])

  const closeAlert = () => {
    if (!alert.browserWindow) return

    alert.browserWindow.close()
  }

  const alertOptions = {
    title: i18next.t('changeSyncFrequency.timeModalDialog.title'),
    icon: 'question',
    customClass: getAlertCustomClassObj({
      title: 'titleColor',
      container: 'textColor',
      input: 'textColor rangeInput'
    }),
    focusConfirm: true,
    showCancelButton: true,
    confirmButtonText: i18next
      .t('common.confirmButtonText'),
    cancelButtonText: i18next
      .t('common.cancelButtonText'),
    progressSteps: [1, 2],
    currentProgressStep: 1,
    input: 'range',
    willOpen: () => {
      if (!alert.browserWindow) return

      alert.browserWindow.once('blur', closeAlert)
    }
  }

  const getAlertOpts = (timeFormat, timeData) => {
    const timeFormatMap = {
      mins: i18next
        .t('changeSyncFrequency.timeFormatModalDialog.inputOptions.mins'),
      hours: i18next
        .t('changeSyncFrequency.timeFormatModalDialog.inputOptions.hours'),
      days: i18next
        .t('changeSyncFrequency.timeFormatModalDialog.inputOptions.days')
    }
    const text = timeFormatMap[timeFormat] ?? timeFormat ?? ''

    if (timeFormat === 'days') {
      return {
        ...alertOptions,
        text,
        inputValue: timeFormat === timeData.timeFormat
          ? timeData.value
          : 1,
        inputAttributes: {
          min: 1,
          max: 31,
          step: 1
        }
      }
    }
    if (timeFormat === 'hours') {
      return {
        ...alertOptions,
        text,
        inputValue: timeFormat === timeData.timeFormat
          ? timeData.value
          : 2,
        inputAttributes: {
          min: 1,
          max: 23,
          step: 1
        }
      }
    }

    return {
      ...alertOptions,
      text,
      inputValue: timeFormat === timeData.timeFormat
        ? timeData.value
        : 20,
      inputAttributes: {
        min: 10,
        max: 59,
        step: 1
      }
    }
  }

  return async () => {
    const win = electron.BrowserWindow.getFocusedWindow()

    const alertEventHandlerCtx = addOnceProcEventHandler(
      WINDOW_EVENT_NAMES.CLOSED,
      closeAlert,
      win
    )

    try {
      const savedSchedulerRule = await configsKeeper
        .getConfigByName('schedulerRule')
      const timeData = _getTimeDataFromRule(savedSchedulerRule)

      const timeFormatRes = await _fireAlert({
        title: i18next
          .t('changeSyncFrequency.timeFormatModalDialog.title'),
        currentProgressStep: 0,
        inputRadioOptions: [
          {
            label: i18next
              .t('changeSyncFrequency.timeFormatModalDialog.inputOptions.mins'),
            value: 'mins'
          },
          {
            label: i18next
              .t('changeSyncFrequency.timeFormatModalDialog.inputOptions.hours'),
            value: 'hours',
            checked: true
          },
          {
            label: i18next
              .t('changeSyncFrequency.timeFormatModalDialog.inputOptions.days'),
            value: 'days'
          }
        ].map((opt) => {
          if (!timeData?.timeFormat) {
            return opt
          }
          if (opt.value === timeData.timeFormat) {
            opt.checked = true

            return opt
          }

          opt.checked = false

          return opt
        })
      })

      if (timeFormatRes?.dismiss !== 'confirm') {
        return
      }

      const alertRes = await _fireFrameless(
        alert,
        getAlertOpts(timeFormatRes.inputRadioValue, timeData)
      )
      alertEventHandlerCtx.removeListener()

      if (alertRes.dismiss) {
        return
      }

      const schedulerRule = _getSchedulerRule(
        timeFormatRes.inputRadioValue,
        alertRes
      )

      if (savedSchedulerRule === schedulerRule) {
        return
      }

      await pauseApp()
      const isSaved = await configsKeeper
        .saveConfigs({ schedulerRule })

      if (!isSaved) {
        throw new SyncFrequencyChangingError()
      }

      relaunch()
    } catch (err) {
      try {
        await showErrorModalDialog(
          win,
          i18next.t('changeSyncFrequency.title'),
          err
        )
      } catch (err) {
        console.error(err)
      }

      console.error(err)
      relaunch()
    }
  }
}
