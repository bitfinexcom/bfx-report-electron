import { connect } from 'react-redux'
import Ledgers from './Ledgers'

function mapStateToProps(state = {}) {
  return {
    entries: state.ledgers.entries,
  }
}

const LedgersContainer = connect(mapStateToProps)(Ledgers)

export default LedgersContainer
