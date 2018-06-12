import { connect } from 'react-redux'
import Header from './Header'
import actions from '../../state/auth/actions'

const mapDispatchToProps = dispatch => ({
  showAuth: () => {
    dispatch(actions.showAuth())
  },
})

const HeaderContainer = connect(null, mapDispatchToProps)(Header)

export default HeaderContainer
