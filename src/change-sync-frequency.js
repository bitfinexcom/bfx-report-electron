'use strict'

const cronValidate = require('cron-validate')
const i18next = require('i18next')

const { createModalWindow } = require('./window-creators')
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

const _getSchedulerRule = (timeFormat, timeValue) => {
  if (timeFormat === 'days') {
    return `0 0 */${timeValue} * *`
  }
  if (timeFormat === 'hours') {
    return `0 */${timeValue} * * *`
  }

  return `*/${timeValue} * * * *`
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
    timeValue: time.replace('*/', '')
  }
}

const _getTimeDataFromRule = (rule) => {
  const cronResult = cronValidate(rule)

  if (!cronResult.isValid()) {
    return { timeFormat: 'hours', timeValue: 2 }
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

  return { timeFormat: 'hours', timeValue: 2 }
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
      shouldWinBeClosedIfClickingOutside: true
    })

  return res?.modalRes ?? {}
}

module.exports = () => {
  const configsKeeper = getConfigsKeeperByName('main')

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
    input: 'range'
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
        text,
        inputRangeOptions: [{
          value: timeFormat === timeData.timeFormat
            ? timeData.timeValue
            : 1,
          min: 1,
          max: 31,
          step: 1
        }]
      }
    }
    if (timeFormat === 'hours') {
      return {
        ...alertOptions,
        text,
        inputRangeOptions: [{
          value: timeFormat === timeData.timeFormat
            ? timeData.timeValue
            : 2,
          min: 1,
          max: 23,
          step: 1
        }]
      }
    }

    return {
      ...alertOptions,
      text,
      inputRangeOptions: [{
        value: timeFormat === timeData.timeFormat
          ? timeData.timeValue
          : 20,
        min: 10,
        max: 59,
        step: 1
      }]
    }
  }

  return async () => {
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

      const alertRes = await _fireAlert({
        title: i18next
          .t('changeSyncFrequency.timeModalDialog.title'),
        currentProgressStep: 1,
        ...getAlertOpts(timeFormatRes.inputRadioValue, timeData)
      })

      if (alertRes?.dismiss !== 'confirm') {
        return
      }

      const schedulerRule = _getSchedulerRule(
        timeFormatRes.inputRadioValue,
        alertRes.inputRangeValue
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
          null,
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
