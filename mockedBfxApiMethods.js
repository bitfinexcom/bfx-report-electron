'use strict'

const moment = require('moment')

const userAccountStart = Date.UTC(2013, 0, 1)
const numberOfEntriesPerDay = 1_000
const msPerDay = 24 * 60 * 60 * 1_000
const msBetweenEnrties = msPerDay / (numberOfEntriesPerDay - 1)

const getMtsArray = (params) => {
  const start = Math.max(userAccountStart, params?.start ?? 0)
  const end = Math.min(Date.now(), params?.end ?? Date.now())
  const limit = Math.min(10_000, params?.limit ?? 10_000)
  const order = params?.order ?? -1
  const isASC = order > 0

  const res = []

  const timePoint = isASC ? start : end
  const roundOff = (ms) => (
    isASC ? Math.ceil(ms) : Math.floor(ms)
  )
  const mDate = moment.utc(timePoint)
  const year = mDate.year()
  const month = mDate.month()
  const date = mDate.date()
  const mDateOfDay = moment.utc({ year, month, date })
  const mDateOfDayMs = mDateOfDay.valueOf()
  const diff = mDate.diff(mDateOfDay)
  const firstPointMs = diff === 0
    ? timePoint
    : mDateOfDayMs + (
      roundOff(diff / msBetweenEnrties) * msBetweenEnrties
    )

  for (let i = 0; res.length < limit; i += 1) {
    const ms = isASC
      ? firstPointMs + (msBetweenEnrties * i)
      : firstPointMs - (msBetweenEnrties * i)

    if (isASC && ms > end) {
      break
    }
    if (!isASC && ms < start) {
      break
    }

    res.push(Math.trunc(ms))
  }

  return res
}

const getRandomInt = (min, max) => {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)

  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

const getOneFromRangeByCounter = (counter = 0, range = []) => {
  const i = counter % range.length

  return range[i]
}

const ccyList = ['BTC', 'ETH', 'LTC', 'UST', 'USD']
const ledgerDescriptionList = [
  'Crypto Withdrawal fee on wallet exchange',
  'Transfer of 1020.0 UST from wallet Exchange to Exchange SA(ezewer->ezewert) on wallet exchange',
  'Exchange 0.136 AAVE for USD @ 60.343 on wallet exchange',
  'Trading fees for 0.005778 XAUT (XAUT:USD) @ 1896.6 on BFX (0.2%) on wallet exchange',
  'Margin Funding Charge on wallet margin',
  'Settlement @ 1.0005 on wallet margin',
  'Position closed @ 1.0001 (TRADE) on wallet margin',
  'Position #168174072 funding cost on wallet margin'
]

module.exports = new Map([
  [
    'platform_status',
    () => [1]
  ],
  [
    'login',
    () => [
      '12345678-8888-4321-1234-8cb090a01360',
      [
        [
          'otp',
          true
        ]
      ]
    ]
  ],
  [
    'login_verify',
    () => [
      'pub:api:88888888-4444-4444-4444-121212121212-caps:s:o:f:w:wd:a-write',
      '2023-03-21T12:00:00.000Z'
    ]
  ],
  [
    'generate_token',
    () => ['pub:api:88888888-4444-4444-4444-121212121212-caps:s:o:f:w:wd:a-write']
  ],
  [
    'delete_token',
    () => [1]
  ],
  [
    'user_info',
    () => [
      123,
      'fake@email.fake',
      'fakename',
      null,
      null,
      null,
      null,
      'Timisoara'
    ]
  ],
  // TODO:
  [
    'ledgers',
    (args) => {
      return getMtsArray(args)
        .map((mts, i) => {
          const num = 0.001 * (i + 1)

          return [
            Number.parseInt(`${mts}${getRandomInt(100, 999)}`),
            getOneFromRangeByCounter(i, ccyList),
            null,
            mts,
            null,
            num * (i % 2 ? -1 : 1),
            num,
            null,
            getOneFromRangeByCounter(i, ledgerDescriptionList)
          ]
        })
    }
  ]
])
