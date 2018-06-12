import { connect } from 'react-redux'
import Timeframe from './Timeframe'
// import actions from '../../state/auth/actions'

function mapStateToProps(state = {}) {
  return state;
}

// const mapDispatchToProps = dispatch => ({
// setKey: (key, secret) => {
// dispatch(actions.setApiKey(key, secret))
// },
// })

const TimeframeContainer = connect(mapStateToProps)(Timeframe)

export default TimeframeContainer
