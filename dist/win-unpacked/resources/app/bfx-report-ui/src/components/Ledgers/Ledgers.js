import React from 'react'
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

export const Ledgers = (props) => {
  const numRows = props.entries.length
  const idCellRenderer = rowIndex => <Cell>{props.entries[rowIndex].id}</Cell>

  const mtsCellRenderer = rowIndex => <Cell><TruncatedFormat>{new Date(props.entries[rowIndex].timestampMilli).toLocaleString()}</TruncatedFormat></Cell>

  const currencyCellRenderer = rowIndex => <Cell>{props.entries[rowIndex].currency}</Cell>

  const amountCellRenderer = rowIndex => <Cell>{props.entries[rowIndex].amount}</Cell>

  const balanceCellRenderer = rowIndex => <Cell>{props.entries[rowIndex].balance}</Cell>

  // TODO: show description message

  return (
    <Card interactive elevation={Elevation.ZERO} className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
      <h5>Ledgers</h5>
      <Table className='bitfinex-table' numRows={numRows} enableRowHeader={false}>
        <Column id='id' name='#' cellRenderer={idCellRenderer} />
        <Column id='mts' name='Time' cellRenderer={mtsCellRenderer} />
        <Column id='currency' name='Currency' cellRenderer={currencyCellRenderer} />
        <Column id='amount' name='Amount' cellRenderer={amountCellRenderer} />
        <Column id='balance' name='Balance' cellRenderer={balanceCellRenderer} />
      </Table>
    </Card>
  )
}

Ledgers.propTypes = {
  entries: PropTypes.array.isRequired,
}

export default Ledgers
