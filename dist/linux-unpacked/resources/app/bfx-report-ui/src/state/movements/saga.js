import { call, put, select, takeLatest } from 'redux-saga/effects'
import types from './constants'
import { postJsonfetch, selectAuth } from '../../state/utils'
import { platform } from '../../var/config'

function getMovements(auth) {
  return postJsonfetch(`${platform.API_URL}/get-data`, {
    auth,
    method: 'getMovements',
  })
}

function* fetchMovements() {
  const auth = yield select(selectAuth)
  try {
    const data = yield call(getMovements, auth)
    yield put({
      type: types.UPDATE_MOVEMENTS,
      payload: (data && data.result) || [],
    })
  } catch (error) {
    // TODO: handle error case
    // eslint-disable-next-line no-console
    console.error(error)
  }
}

export default function* movementsSaga() {
  yield takeLatest(types.FETCH_MOVEMENTS, fetchMovements)
}
