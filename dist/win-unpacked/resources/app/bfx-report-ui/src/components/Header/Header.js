import React from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Intent,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  NavbarDivider,
} from '@blueprintjs/core'
import { platform } from '../../var/config'

function handleClick(event) {
  if (event.target.name === 'dark') {
    document.body.className = 'pt-dark'
  } else {
    document.body.className = ''
  }
}

function Header(props) {
  function showAuth() {
    props.showAuth()
  }

  return (
    <Navbar>
      <NavbarGroup align='left'>
        <NavbarHeading>{platform.Name} Report</NavbarHeading>
      </NavbarGroup>
      <NavbarGroup align='right'>
        <Button minimal text='Auth' intent={Intent.PRIMARY} onClick={showAuth} />
        <NavbarDivider />
        <Button minimal name='light' text='Light' onClick={handleClick} />
        <NavbarDivider />
        <Button minimal name='dark' text='Dark' onClick={handleClick} />
      </NavbarGroup>
    </Navbar>
  )
}

Header.propTypes = {
  showAuth: PropTypes.func.isRequired,
}

export default Header
