// https://docs.bitfinex.com/v2/reference#movements
import types from './constants'

/*
{
    "result": [
        {
            "domain": null,
            "_events": {},
            "_eventsCount": 0,
            "_fields": {
                "id": 0,
                "currency": 1,
                "currencyName": 2,
                "mtsStarted": 5,
                "mtsUpdated": 6,
                "status": 9,
                "amount": 12,
                "fees": 13,
                "destinationAddress": 16,
                "transactionId": 20
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "currencyName",
                "mtsStarted",
                "mtsUpdated",
                "status",
                "amount",
                "fees",
                "destinationAddress",
                "transactionId"
            ],
            "id": 1350463,
            "currency": "ETH",
            "currencyName": "ETHEREUM",
            "mtsStarted": 1528251777000,
            "mtsUpdated": 1528251998000,
            "status": "PENDING REVIEW",
            "amount": -0.9976,
            "fees": -0.0024,
            "destinationAddress": "0x9AE5d369c3E5833A1664fA7F8A757D226669f3c6",
            "transactionId": null
        }
    ],
    "id": 5
}
 */
const initialState = {
  entries: [
    /* {
      currency: 'ETH',
      currencyName: 'ETHEREUM',
      mtsStarted: 1528251777000,
      mtsUpdated: 1528251998000,
      status: 'PENDING REVIEW',
      amount: -0.9976,
      fees: -0.0024,
      destinationAddress: '0x9AE5d369c3E5833A1664fA7F8A757D226669f3c6',
      transactionId: '',
    }, */
  ],
}

export function movementsReducer(state = initialState, action) {
  switch (action.type) {
    case types.UPDATE_MOVEMENTS: {
      const result = action.payload;
      const entries = result.map(entry => ({
        id: entry.id,
        currency: entry.currency,
        currencyName: entry.currencyName,
        mtsStarted: entry.mtsStarted,
        mtsUpdated: entry.mtsUpdated,
        status: entry.status,
        amount: entry.amount,
        fees: entry.fees,
        destinationAddress: entry.destinationAddress,
        transactionId: entry.transactionId,
      }))
      return {
        ...state,
        entries,
      }
    }
    default: {
      return state
    }
  }
}

export default movementsReducer
