import React from 'react'
import PropTypes from 'prop-types'
import Ledgers from '../Ledgers'
import Movements from '../Movements'
import Orders from '../Orders'
import Timeframe from '../Timeframe'
import Trades from '../Trades'

function Main(props) {
  return props.isValid && !props.authIsShown ? (
    <div className='row'>
      <Timeframe />
      <Ledgers />
      <Trades />
      <Orders />
      <Movements />
    </div>
  ) : ''
}

Main.propTypes = {
  authIsShown: PropTypes.bool.isRequired,
  isValid: PropTypes.bool,
}

export default Main
