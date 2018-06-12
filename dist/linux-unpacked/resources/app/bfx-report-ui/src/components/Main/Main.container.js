import { connect } from 'react-redux'
import Main from './Main'

function mapStateToProps(state = {}) {
  return {
    authIsShown: state.auth.isShown,
    isValid: state.auth.isValid,
  }
}

const MainContainer = connect(mapStateToProps)(Main)

export default MainContainer
