'use strict'

const modalDialogPromiseSet = new Set()

module.exports = async (asyncHandler) => {
  let resolve = () => {}
  const promise = new Promise((_resolve) => {
    resolve = _resolve
  })

  const promisesForAwaiting = [...modalDialogPromiseSet]
  modalDialogPromiseSet.add(promise)
  await Promise.all(promisesForAwaiting)
  const res = await asyncHandler()
  resolve()
  modalDialogPromiseSet.delete(promise)
  return res
}
