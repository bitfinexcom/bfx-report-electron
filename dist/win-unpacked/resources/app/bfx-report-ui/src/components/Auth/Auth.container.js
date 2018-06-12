import { connect } from 'react-redux'
import Auth from './Auth'
import actions from '../../state/auth/actions'

function mapStateToProps(state = {}) {
  return {
    apiKey: state.auth.apiKey,
    apiSecret: state.auth.apiSecret,
    isShown: state.auth.isShown,
    isValid: state.auth.isValid,
  }
}

const mapDispatchToProps = dispatch => ({
  checkAuth: () =>
    dispatch(actions.checkAuth()),
  setKey: key => dispatch(actions.setApiKey(key)),
  setSecret: secret => dispatch(actions.setApiSecret(secret)),
})

const AuthContainer = connect(mapStateToProps, mapDispatchToProps)(Auth)

export default AuthContainer
