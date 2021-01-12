'use strict'

const electron = require('electron')
const Alert = require('electron-alert')

const {
  SyncFrequencyChangingError
} = require('./errors')
const showErrorModalDialog = require('./show-error-modal-dialog')
const pauseApp = require('./pause-app')
const relaunch = require('./relaunch')
const { getConfigsKeeperByName } = require('./configs-keeper')

module.exports = () => {
  const timeFormatAlert = new Alert()
  const alert = new Alert()

  const closeTimeFormatAlert = () => {
    if (!timeFormatAlert.browserWindow) return

    timeFormatAlert.browserWindow.close()
  }
  const closeAlert = () => {
    if (!alert.browserWindow) return

    alert.browserWindow.close()
  }

  const timeFormatAlertOptions = {
    title: 'Set time format',
    type: 'question',
    input: 'radio',
    inputValue: 'mins',
    inputOptions: {
      mins: 'Mins',
      hours: 'Hours',
      days: 'Days'
    },
    onBeforeOpen: () => {
      if (!timeFormatAlert.browserWindow) return

      timeFormatAlert.browserWindow.once('blur', closeTimeFormatAlert)
    }
  }
  const alertOptions = {
    title: 'Set sync frequency',
    text: timeFormatAlertOptions.inputOptions.mins,
    type: 'question',
    input: 'range',
    inputValue: 20,
    inputAttributes: {
      min: 5,
      max: 60,
      step: 1
    },
    onBeforeOpen: () => {
      if (!alert.browserWindow) return

      alert.browserWindow.once('blur', closeAlert)
    }
  }
  const sound = { freq: 'F2', type: 'triange', duration: 1.5 }

  const getAlertOpts = (timeFormat) => {
    const { inputAttributes } = alertOptions
    const { inputOptions } = timeFormatAlertOptions
    const text = inputOptions[timeFormat.value]

    if (timeFormat.value === 'hours') {
      return {
        ...alertOptions,
        text,
        inputValue: 1,
        inputAttributes: {
          ...inputAttributes,
          min: 1,
          max: 24
        }
      }
    }
    if (timeFormat.value === 'days') {
      return {
        ...alertOptions,
        text,
        inputValue: 1,
        inputAttributes: {
          ...inputAttributes,
          min: 1,
          max: 30
        }
      }
    }

    return alertOptions
  }

  return async () => {
    const win = electron.BrowserWindow.getFocusedWindow()
    win.once('closed', closeTimeFormatAlert)
    win.once('closed', closeAlert)

    try {
      const timeFormat = await timeFormatAlert.fireFrameless(
        timeFormatAlertOptions, null, true, false, sound
      )
      win.removeListener('closed', closeTimeFormatAlert)

      if (
        timeFormat.dismiss === Alert.DismissReason.cancel ||
        timeFormat.dismiss === Alert.DismissReason.close
      ) {
        return
      }

      const alertRes = await alert.fireFrameless(
        getAlertOpts(timeFormat), null, true, false, sound
      )
      win.removeListener('closed', closeAlert)

      if (
        timeFormat.dismiss === Alert.DismissReason.cancel ||
        timeFormat.dismiss === Alert.DismissReason.close
      ) {
        return
      }

      const schedulerRule = '' // TODO:

      await pauseApp()
      const isSaved = await getConfigsKeeperByName('main')
        .saveConfigs({ schedulerRule })

      if (!isSaved) {
        throw new SyncFrequencyChangingError()
      }

      relaunch()
    } catch (err) {
      try {
        await showErrorModalDialog(win, 'Change sync frequency', err)
      } catch (err) {
        console.error(err)
      }

      console.error(err)
      relaunch()
    }
  }
}
