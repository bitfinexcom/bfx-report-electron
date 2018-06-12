import { connect } from 'react-redux'
import Orders from './Orders'

function mapStateToProps(state = {}) {
  return {
    entries: state.orders.entries,
  }
}

const OrdersContainer = connect(mapStateToProps)(Orders)

export default OrdersContainer
