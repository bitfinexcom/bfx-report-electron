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

export const Movements = (props) => {
  const numRows = props.entries.length
  const idCellRenderer = rowIndex => <Cell>{props.entries[rowIndex].id}</Cell>

  const mtsStartedCellRenderer = rowIndex => <Cell><TruncatedFormat>{new Date(props.entries[rowIndex].mtsStarted).toLocaleString()}</TruncatedFormat></Cell>

  const mtsUpdatedCellRenderer = rowIndex => <Cell><TruncatedFormat>{new Date(props.entries[rowIndex].mtsUpdated).toLocaleString()}</TruncatedFormat></Cell>

  const currencyCellRenderer = rowIndex => <Cell>{props.entries[rowIndex].currency}</Cell>

  const amountCellRenderer = rowIndex => <Cell>{props.entries[rowIndex].amount}</Cell>

  const statusCellRenderer = rowIndex => <Cell>{props.entries[rowIndex].status}</Cell>

  const destinationCellRenderer = rowIndex => <Cell>{props.entries[rowIndex].destinationAddress}</Cell>

  return (
    <Card interactive elevation={Elevation.ZERO} className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
      <h5>Movements</h5>
      <Table className='bitfinex-table' numRows={numRows} enableRowHeader={false}>
        <Column id='id' name='#' cellRenderer={idCellRenderer} />
        <Column id='mtsstarted' name='Started' cellRenderer={mtsStartedCellRenderer} />
        <Column id='mtsstarted' name='Updated' cellRenderer={mtsUpdatedCellRenderer} />
        <Column id='currency' name='Currency' cellRenderer={currencyCellRenderer} />
        <Column id='amount' name='Amount' cellRenderer={amountCellRenderer} />
        <Column id='status' name='Status' cellRenderer={statusCellRenderer} />
        <Column id='destination' name='Destination' cellRenderer={destinationCellRenderer} />
      </Table>
    </Card>
  )
}

Movements.propTypes = {
  entries: PropTypes.array.isRequired,
}

export default Movements;
