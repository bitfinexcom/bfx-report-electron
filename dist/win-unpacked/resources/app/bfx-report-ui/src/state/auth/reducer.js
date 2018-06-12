import types from './constants'

const initialState = {
  apiKey: '',
  apiSecret: '',
  authKey: '',
  isValid: null,
  isShown: true,
}

export function authReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_API_KEY:
      return {
        ...state,
        apiKey: action.payload,
      };
    case types.SET_API_SECRET:
      return {
        ...state,
        apiSecret: action.payload,
      };
    case types.SET_AUTH_KEY:
      return {
        ...state,
        authKey: action.payload,
      }
    case types.UPDATE_AUTH_RESULT:
      return {
        ...state,
        isValid: action.payload,
        isShown: !action.payload,
      }
    case types.SHOW_AUTH:
      return {
        ...state,
        isShown: true,
      }
    default:
      return state
  }
}

export default authReducer
