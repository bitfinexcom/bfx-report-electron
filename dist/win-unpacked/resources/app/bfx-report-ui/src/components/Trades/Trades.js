import React from 'react';
import PropTypes from 'prop-types'
import {
  Card,
  Elevation,
} from '@blueprintjs/core'
import {
  Cell,
  Column,
  Table,
  TruncatedFormat,
} from '@blueprintjs/table'

export const Trades = (props) => {
  const numRows = props.entries.length
  const idCellRenderer = rowIndex => <Cell>{props.entries[rowIndex].id}</Cell>

  const mtsCellRenderer = rowIndex => <Cell><TruncatedFormat>{new Date(props.entries[rowIndex].mts).toLocaleString()}</TruncatedFormat></Cell>

  const amountCellRenderer = rowIndex => <Cell>{props.entries[rowIndex].amount}</Cell>

  const priceCellRenderer = rowIndex => <Cell>{props.entries[rowIndex].price}</Cell>

  return (
    <Card interactive elevation={Elevation.ZERO} className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
      <h5>Trades</h5>
      <Table className='bitfinex-table' numRows={numRows} enableRowHeader={false}>
        <Column id='id' name='#' cellRenderer={idCellRenderer} />
        <Column id='mts' name='Time' cellRenderer={mtsCellRenderer} />
        <Column id='amount' name='Amount' cellRenderer={amountCellRenderer} />
        <Column id='price' name='Price' cellRenderer={priceCellRenderer} />
      </Table>
    </Card>
  )
}

Trades.propTypes = {
  entries: PropTypes.array.isRequired,
}

export default Trades;
