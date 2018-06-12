// https://docs.bitfinex.com/v2/reference#rest-auth-trades-hist
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
                "mts": 1,
                "amount": 2,
                "price": 3
            },
            "_boolFields": [],
            "_fieldKeys": [
                "id",
                "mts",
                "amount",
                "price"
            ],
            "id": 24172397,
            "mts": 1528147137131,
            "amount": -0.1,
            "price": 17602
        }
    ],
    "id": 5
}
 */
const initialState = {
  entries: [
    /* {
      id: 24172397,
      mts: 1528147137131,
      amount: -0.1,
      price: 17602,
    }, */
  ],
}

export function tradesReducer(state = initialState, action) {
  switch (action.type) {
    case types.UPDATE_TRADES: {
      const result = action.payload;
      const entries = result.map(entry => ({
        id: entry.id,
        mts: entry.mts,
        amount: entry.amount,
        price: entry.price,
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

export default tradesReducer
