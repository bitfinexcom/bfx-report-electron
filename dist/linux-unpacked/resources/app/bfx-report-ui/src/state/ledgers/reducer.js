// https://docs.bitfinex.com/v2/reference#ledgers
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
                "timestampMilli": 3,
                "amount": 5,
                "balance": 6,
                "description": 8
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "timestampMilli",
                "amount",
                "balance",
                "description"
            ],
            "id": 131918364,
            "currency": "ETH",
            "timestampMilli": 1528251777000,
            "amount": -0.9976,
            "balance": 49.0024,
            "description": "Ethereum Withdrawal #1350463 on wallet exchange"
        },
        {
            "domain": null,
            "_events": {},
            "_eventsCount": 0,
            "_fields": {
                "id": 0,
                "currency": 1,
                "timestampMilli": 3,
                "amount": 5,
                "balance": 6,
                "description": 8
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "timestampMilli",
                "amount",
                "balance",
                "description"
            ],
            "id": 131918365,
            "currency": "ETH",
            "timestampMilli": 1528251777000,
            "amount": -0.0024,
            "balance": 49,
            "description": "Crypto Withdrawal fee on wallet exchange"
        },
        {
            "domain": null,
            "_events": {},
            "_eventsCount": 0,
            "_fields": {
                "id": 0,
                "currency": 1,
                "timestampMilli": 3,
                "amount": 5,
                "balance": 6,
                "description": 8
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "timestampMilli",
                "amount",
                "balance",
                "description"
            ],
            "id": 131916866,
            "currency": "BTC",
            "timestampMilli": 1527625560000,
            "amount": -0.81,
            "balance": 19,
            "description": "Exchange 0.81 BTC for USD @ 1020.0 on wallet exchange"
        },
        {
            "domain": null,
            "_events": {},
            "_eventsCount": 0,
            "_fields": {
                "id": 0,
                "currency": 1,
                "timestampMilli": 3,
                "amount": 5,
                "balance": 6,
                "description": 8
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "timestampMilli",
                "amount",
                "balance",
                "description"
            ],
            "id": 131916865,
            "currency": "USD",
            "timestampMilli": 1527625560000,
            "amount": 826.2,
            "balance": 21019.8062,
            "description": "Exchange 0.81 BTC for USD @ 1020.0 on wallet exchange"
        },
        {
            "domain": null,
            "_events": {},
            "_eventsCount": 0,
            "_fields": {
                "id": 0,
                "currency": 1,
                "timestampMilli": 3,
                "amount": 5,
                "balance": 6,
                "description": 8
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "timestampMilli",
                "amount",
                "balance",
                "description"
            ],
            "id": 131916868,
            "currency": "USD",
            "timestampMilli": 1527625560000,
            "amount": -0.8262,
            "balance": 21018.98,
            "description": "Trading fees for 0.81 BTC (BTCUSD) @ 1020.0 on BFX (0.1%) on wallet exchange"
        },
        {
            "domain": null,
            "_events": {},
            "_eventsCount": 0,
            "_fields": {
                "id": 0,
                "currency": 1,
                "timestampMilli": 3,
                "amount": 5,
                "balance": 6,
                "description": 8
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "timestampMilli",
                "amount",
                "balance",
                "description"
            ],
            "id": 131916864,
            "currency": "USD",
            "timestampMilli": 1527625498000,
            "amount": -0.102,
            "balance": 20193.6062,
            "description": "Trading fees for 0.1 BTC (BTCUSD) @ 1020.0 on BFX (0.1%) on wallet exchange"
        },
        {
            "domain": null,
            "_events": {},
            "_eventsCount": 0,
            "_fields": {
                "id": 0,
                "currency": 1,
                "timestampMilli": 3,
                "amount": 5,
                "balance": 6,
                "description": 8
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "timestampMilli",
                "amount",
                "balance",
                "description"
            ],
            "id": 131916860,
            "currency": "BTC",
            "timestampMilli": 1527625497000,
            "amount": -0.1,
            "balance": 19.81,
            "description": "Exchange 0.1 BTC for USD @ 1020.0 on wallet exchange"
        },
        {
            "domain": null,
            "_events": {},
            "_eventsCount": 0,
            "_fields": {
                "id": 0,
                "currency": 1,
                "timestampMilli": 3,
                "amount": 5,
                "balance": 6,
                "description": 8
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "timestampMilli",
                "amount",
                "balance",
                "description"
            ],
            "id": 131916859,
            "currency": "USD",
            "timestampMilli": 1527625497000,
            "amount": 102,
            "balance": 20193.7082,
            "description": "Exchange 0.1 BTC for USD @ 1020.0 on wallet exchange"
        },
        {
            "domain": null,
            "_events": {},
            "_eventsCount": 0,
            "_fields": {
                "id": 0,
                "currency": 1,
                "timestampMilli": 3,
                "amount": 5,
                "balance": 6,
                "description": 8
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "timestampMilli",
                "amount",
                "balance",
                "description"
            ],
            "id": 131916854,
            "currency": "USD",
            "timestampMilli": 1527625477000,
            "amount": -0.0918,
            "balance": 20091.7082,
            "description": "Trading fees for 0.09 BTC (BTCUSD) @ 1020.0 on BFX (0.1%) on wallet exchange"
        },
        {
            "domain": null,
            "_events": {},
            "_eventsCount": 0,
            "_fields": {
                "id": 0,
                "currency": 1,
                "timestampMilli": 3,
                "amount": 5,
                "balance": 6,
                "description": 8
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "timestampMilli",
                "amount",
                "balance",
                "description"
            ],
            "id": 131916850,
            "currency": "BTC",
            "timestampMilli": 1527625475000,
            "amount": -0.09,
            "balance": 19.91,
            "description": "Exchange 0.09 BTC for USD @ 1020.0 on wallet exchange"
        },
        {
            "domain": null,
            "_events": {},
            "_eventsCount": 0,
            "_fields": {
                "id": 0,
                "currency": 1,
                "timestampMilli": 3,
                "amount": 5,
                "balance": 6,
                "description": 8
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "timestampMilli",
                "amount",
                "balance",
                "description"
            ],
            "id": 131916849,
            "currency": "USD",
            "timestampMilli": 1527625475000,
            "amount": 91.8,
            "balance": 20091.8,
            "description": "Exchange 0.09 BTC for USD @ 1020.0 on wallet exchange"
        },
        {
            "domain": null,
            "_events": {},
            "_eventsCount": 0,
            "_fields": {
                "id": 0,
                "currency": 1,
                "timestampMilli": 3,
                "amount": 5,
                "balance": 6,
                "description": 8
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "timestampMilli",
                "amount",
                "balance",
                "description"
            ],
            "id": 131916764,
            "currency": "ETH",
            "timestampMilli": 1527488522000,
            "amount": 50,
            "balance": 50,
            "description": "Test on wallet exchange"
        },
        {
            "domain": null,
            "_events": {},
            "_eventsCount": 0,
            "_fields": {
                "id": 0,
                "currency": 1,
                "timestampMilli": 3,
                "amount": 5,
                "balance": 6,
                "description": 8
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "timestampMilli",
                "amount",
                "balance",
                "description"
            ],
            "id": 131916763,
            "currency": "USD",
            "timestampMilli": 1527488515000,
            "amount": 20000,
            "balance": 20000,
            "description": "Test on wallet exchange"
        },
        {
            "domain": null,
            "_events": {},
            "_eventsCount": 0,
            "_fields": {
                "id": 0,
                "currency": 1,
                "timestampMilli": 3,
                "amount": 5,
                "balance": 6,
                "description": 8
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "currency",
                "timestampMilli",
                "amount",
                "balance",
                "description"
            ],
            "id": 131916762,
            "currency": "BTC",
            "timestampMilli": 1527488508000,
            "amount": 20,
            "balance": 20,
            "description": "Test on wallet exchange"
        }
    ],
    "id": 5
}
*/
const initialState = {
  // the default might be configuable on server only,
  // can we fetch that config?
  valueCurrency: 'default', // if the user specified a value currency
  entries: [
    /* {
      id: 131919156,
      currency: 'USD',
      timestampMilli: 1528335001000,
      amount: 17.18587619,
      balance: 5018.07087619,
      description: 'Margin Funding Payment on wallet funding',
    },
    {
      id: 131918375,
      currency: 'USD',
      timestampMilli: 1528274257000,
      amount: 5000.885,
      balance: 5000.885,
      description: 'Transfer of 5000.885 USD from wallet Exchange to Deposit on wallet funding',
    }, */
  ],
}

export function ledgersReducer(state = initialState, action) {
  switch (action.type) {
    case types.UPDATE_LEDGERS: {
      const result = action.payload;
      const entries = result.map(entry => ({
        id: entry.id,
        currency: entry.currency,
        timestampMilli: entry.timestampMilli,
        amount: entry.amount,
        balance: entry.balance,
        description: entry.description,
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

export default ledgersReducer
