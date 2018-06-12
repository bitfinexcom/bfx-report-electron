// https://docs.bitfinex.com/v2/reference#rest-auth-orders
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
                "gid": 1,
                "cid": 2,
                "symbol": 3,
                "mtsCreate": 4,
                "mtsUpdate": 5,
                "amount": 6,
                "amountOrig": 7,
                "type": 8,
                "typePrev": 9,
                "flags": 12,
                "status": 13,
                "price": 16,
                "priceAvg": 17,
                "priceTrailing": 18,
                "priceAuxLimit": 19,
                "notify": 23,
                "placedId": 25
            },
            "_boolFields": [
                "notify"
            ],
            "_fieldKeys": [
                "id",
                "gid",
                "cid",
                "symbol",
                "mtsCreate",
                "mtsUpdate",
                "amount",
                "amountOrig",
                "type",
                "typePrev",
                "flags",
                "status",
                "price",
                "priceAvg",
                "priceTrailing",
                "priceAuxLimit",
                "notify",
                "placedId"
            ],
            "id": 1149715964,
            "gid": null,
            "cid": 12175783466,
            "symbol": "tBTCUSD",
            "mtsCreate": 1527564176000,
            "mtsUpdate": 1527625559000,
            "amount": 0,
            "amountOrig": -1,
            "type": "EXCHANGE LIMIT",
            "typePrev": null,
            "flags": 0,
            "status": "EXECUTED @ 1020.0(-0.81): was PARTIALLY FILLED @ 1020.0(-0.09), PARTIALLY FILLED @ 1020.0(-0.1)",
            "price": 1020,
            "priceAvg": 1020,
            "priceTrailing": 0,
            "priceAuxLimit": 0,
            "notify": 0,
            "placedId": null,
            "_lastAmount": 0
        }
    ],
    "id": 5
}
 */
const initialState = {
  entries: [
    /* {
      gid: '',
      cid: 12175783466,
      symbol: 'tBTCUSD',
      mtsCreate: 1527564176000,
      mtsUpdate: 1527625559000,
      amout: 0,
      amountOrig: -1,
      type: 'EXCHANGE LIMIT',
      typePrev: '',
      flags: 0,
      status: 'EXECUTED @ 1020.0(-0.81): was PARTIALLY FILLED @ 1020.0(-0.09), PARTIALLY FILLED @ 1020.0(-0.1)',
      price: 1020,
      priceAvg: 1020,
      priceTrailing: 0,
      priceAuxLimit: 0,
      notify: 0,
      placedId: '',
    }, */
  ],
}

export function ordersReducer(state = initialState, action) {
  switch (action.type) {
    case types.UPDATE_ORDERS: {
      const result = action.payload;
      const entries = result.map(entry => ({
        id: entry.id,
        gid: entry.gid,
        cid: entry.cid,
        symbol: entry.symbol,
        mtsCreate: entry.mtsCreate,
        mtsUpdate: entry.mtsUpdate,
        amout: entry.amout,
        amountOrig: entry.amountOrig,
        type: entry.type,
        typePrev: entry.typePrev,
        flags: entry.flags,
        status: entry.status,
        price: entry.price,
        priceAvg: entry.priceAvg,
        priceTrailing: entry.priceTrailing,
        priceAuxLimit: entry.priceAuxLimit,
        notify: entry.notify,
        placedId: entry.placedId,
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

export default ordersReducer
