import React from 'react'
// import PropTypes from 'prop-types'
import {
  Button,
  ButtonGroup,
  Card,
  Elevation,
} from '@blueprintjs/core'

function Timeframe() {
  return (
    <Card interactive elevation={Elevation.ZERO} className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
      <ButtonGroup minimal large={false}>
        <Button disabled>Last 24 hours</Button>
        <Button disabled>Yesterday</Button>
        <Button active>Last 2 weeks</Button>
        <Button disabled>Month to date</Button>
        <Button disabled>Past month</Button>
        <Button disabled>Past 3 months</Button>
        <Button disabled>Custom (max range 3 months)</Button>
        <Button icon='cloud-download' disabled>Download</Button>
      </ButtonGroup>
    </Card>
  )
}

export default Timeframe
