import { combineReducers } from 'redux'
import authReducer from './auth/reducer'
import ledgersReducer from './ledgers/reducer'
import movementsReducer from './movements/reducer'
import ordersReducer from './orders/reducer'
import tradesReducer from './trades/reducer'

export default combineReducers({
  auth: authReducer,
  ledgers: ledgersReducer,
  movements: movementsReducer,
  orders: ordersReducer,
  trades: tradesReducer,
})
